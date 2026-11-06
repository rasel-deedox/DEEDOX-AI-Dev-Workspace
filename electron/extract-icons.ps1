param(
    [string]$Path = "",
    [string]$Mode = "single",   # "single", "directory", or "list"
    [string]$ListFile = "",
    [string]$OutputFile = ""
)

Add-Type -AssemblyName System.Drawing -ErrorAction SilentlyContinue

$win32Type = @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Runtime.InteropServices;
using System.Runtime.InteropServices.ComTypes;
using System.Text;
using System.Collections.Generic;

public class NativeShellIcon {
    [DllImport("shell32.dll", CharSet = CharSet.Auto)]
    public static extern IntPtr SHGetFileInfo(
        string pszPath,
        uint dwFileAttributes,
        ref SHFILEINFO psfi,
        uint cbFileInfo,
        uint uFlags
    );

    [DllImport("shell32.dll", CharSet = CharSet.Auto)]
    public static extern uint ExtractIconEx(
        string szFileName,
        int nIconIndex,
        IntPtr[] phiconLarge,
        IntPtr[] phiconSmall,
        uint nIcons
    );

    [DllImport("user32.dll", SetLastError = true)]
    [return: MarshalAs(UnmanagedType.Bool)]
    public static extern bool DestroyIcon(IntPtr hIcon);

    public const uint SHGFI_ICON = 0x000000100;
    public const uint SHGFI_LARGEICON = 0x000000000;

    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Auto)]
    public struct SHFILEINFO {
        public IntPtr hIcon;
        public int iIcon;
        public uint dwAttributes;
        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 260)]
        public string szDisplayName;
        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 80)]
        public string szTypeName;
    };

    [ComImport]
    [Guid("00021401-0000-0000-C000-000000000046")]
    public class ShellLink {}

    [ComImport]
    [InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    [Guid("000214F9-0000-0000-C000-000000000046")]
    public interface IShellLinkW {
        void GetPath([Out, MarshalAs(UnmanagedType.LPWStr)] StringBuilder pszFile, int cchMaxPath, IntPtr pfd, uint fFlags);
        void GetIDList(out IntPtr ppidl);
        void SetIDList(IntPtr pidl);
        void GetDescription([Out, MarshalAs(UnmanagedType.LPWStr)] StringBuilder pszName, int cchMaxName);
        void SetDescription([MarshalAs(UnmanagedType.LPWStr)] string pszName);
        void GetWorkingDirectory([Out, MarshalAs(UnmanagedType.LPWStr)] StringBuilder pszDir, int cchMaxPath);
        void SetWorkingDirectory([MarshalAs(UnmanagedType.LPWStr)] string pszDir);
        void GetArguments([Out, MarshalAs(UnmanagedType.LPWStr)] StringBuilder pszArgs, int cchMaxPath);
        void SetArguments([MarshalAs(UnmanagedType.LPWStr)] string pszArgs);
        void GetHotkey(out short pwHotkey);
        void SetHotkey(short wHotkey);
        void GetShowCmd(out int piShowCmd);
        void SetShowCmd(int iShowCmd);
        void GetIconLocation([Out, MarshalAs(UnmanagedType.LPWStr)] StringBuilder pszIconPath, int cchIconPath, out int piIcon);
        void SetIconLocation([MarshalAs(UnmanagedType.LPWStr)] string pszIconPath, int iIcon);
        void SetRelativePath([MarshalAs(UnmanagedType.LPWStr)] string pszPathRel, uint dwReserved);
        void Resolve(IntPtr hwnd, uint fFlags);
        void SetPath([MarshalAs(UnmanagedType.LPWStr)] string pszFile);
    }

    private static string IconToBase64(Icon icon) {
        if (icon == null) return "";
        try {
            using (Bitmap bmp = icon.ToBitmap())
            using (MemoryStream ms = new MemoryStream()) {
                bmp.Save(ms, ImageFormat.Png);
                return "data:image/png;base64," + Convert.ToBase64String(ms.ToArray());
            }
        } catch {
            return "";
        } finally {
            icon.Dispose();
        }
    }

    private static Icon ExtractFromPath(string path, int iconIndex = 0) {
        if (string.IsNullOrEmpty(path)) return null;
        try {
            if (path.EndsWith(".ico", StringComparison.OrdinalIgnoreCase) && File.Exists(path)) {
                return new Icon(path);
            }
            if (iconIndex != 0) {
                IntPtr[] large = new IntPtr[1];
                if (ExtractIconEx(path, iconIndex, large, null, 1) > 0 && large[0] != IntPtr.Zero) {
                    Icon ico = (Icon)Icon.FromHandle(large[0]).Clone();
                    DestroyIcon(large[0]);
                    return ico;
                }
            }
            SHFILEINFO shinfo = new SHFILEINFO();
            IntPtr hImg = SHGetFileInfo(path, 0, ref shinfo, (uint)Marshal.SizeOf(shinfo), SHGFI_ICON | SHGFI_LARGEICON);
            if (shinfo.hIcon != IntPtr.Zero) {
                Icon ico = (Icon)Icon.FromHandle(shinfo.hIcon).Clone();
                DestroyIcon(shinfo.hIcon);
                return ico;
            }
        } catch {}

        try {
            if (File.Exists(path)) {
                return Icon.ExtractAssociatedIcon(path);
            }
        } catch {}

        return null;
    }

    public static string GetIconBase64(string filePath) {
        if (string.IsNullOrEmpty(filePath)) return "";

        string expanded = Environment.ExpandEnvironmentVariables(filePath);
        if (!File.Exists(expanded) && !Directory.Exists(expanded)) return "";

        // If it's a Windows Shortcut (.lnk), resolve TargetPath and IconLocation
        if (expanded.EndsWith(".lnk", StringComparison.OrdinalIgnoreCase)) {
            try {
                IShellLinkW link = (IShellLinkW)new ShellLink();
                ((IPersistFile)link).Load(expanded, 0);

                // 1. Try explicit IconLocation (e.g., custom icon set on shortcut)
                StringBuilder iconLoc = new StringBuilder(260);
                int iconIdx = 0;
                link.GetIconLocation(iconLoc, iconLoc.Capacity, out iconIdx);
                string cleanIconLoc = Environment.ExpandEnvironmentVariables(iconLoc.ToString().Trim());
                if (!string.IsNullOrEmpty(cleanIconLoc) && File.Exists(cleanIconLoc)) {
                    Icon ico = ExtractFromPath(cleanIconLoc, iconIdx);
                    if (ico != null) {
                        string b64 = IconToBase64(ico);
                        if (!string.IsNullOrEmpty(b64)) return b64;
                    }
                }

                // 2. Try TargetPath (e.g., target executable .exe)
                StringBuilder target = new StringBuilder(260);
                link.GetPath(target, target.Capacity, IntPtr.Zero, 0);
                string cleanTarget = Environment.ExpandEnvironmentVariables(target.ToString().Trim());
                if (!string.IsNullOrEmpty(cleanTarget) && (File.Exists(cleanTarget) || Directory.Exists(cleanTarget))) {
                    Icon ico = ExtractFromPath(cleanTarget);
                    if (ico != null) {
                        string b64 = IconToBase64(ico);
                        if (!string.IsNullOrEmpty(b64)) return b64;
                    }
                }
            } catch {}
        }

        // 3. Fallback: Extract from the file directly (covers .exe, .url, folders, fallback .lnk)
        Icon directIco = ExtractFromPath(expanded);
        if (directIco != null) {
            return IconToBase64(directIco);
        }

        return "";
    }

    public static string ExtractListToJson(string listFilePath, string outputFilePath) {
        if (!File.Exists(listFilePath)) return "[]";
        string[] lines = File.ReadAllLines(listFilePath);
        var list = new List<string>(lines.Length);
        foreach (string line in lines) {
            string trimmed = line.Trim();
            if (string.IsNullOrEmpty(trimmed)) continue;
            string b64 = GetIconBase64(trimmed);
            string safePath = trimmed.Replace("\\", "\\\\").Replace("\"", "\\\"");
            string name = Path.GetFileNameWithoutExtension(trimmed).Replace("\"", "\\\"");
            string ext = Path.GetExtension(trimmed).ToLower().Replace("\"", "\\\"");
            list.Add("{\"path\":\"" + safePath + "\",\"name\":\"" + name + "\",\"ext\":\"" + ext + "\",\"icon\":\"" + b64 + "\"}");
        }
        string json = "[" + string.Join(",", list) + "]";
        if (!string.IsNullOrEmpty(outputFilePath)) {
            try {
                File.WriteAllText(outputFilePath, json, Encoding.UTF8);
            } catch {}
        }
        return json;
    }

    private static void ScanDirRecursive(string dir, int depth, List<string> found) {
        if (depth > 3 || !Directory.Exists(dir)) return;
        try {
            string[] files = Directory.GetFiles(dir);
            foreach (string f in files) {
                string lower = f.ToLower();
                if (lower.EndsWith(".lnk") || lower.EndsWith(".exe") || lower.EndsWith(".url")) {
                    found.Add(f);
                }
            }
            string[] subDirs = Directory.GetDirectories(dir);
            foreach (string sd in subDirs) {
                string sdName = Path.GetFileName(sd).ToLower();
                if (sdName.StartsWith(".") || sdName == "node_modules" || sdName == "windows" || sdName == "appdata") continue;
                ScanDirRecursive(sd, depth + 1, found);
            }
        } catch {}
    }

    public static string ExtractDirectoryToJson(string dirPath, string outputFilePath) {
        if (!Directory.Exists(dirPath)) return "[]";
        var found = new List<string>();
        ScanDirRecursive(dirPath, 0, found);

        var list = new List<string>(found.Count);
        foreach (string file in found) {
            string b64 = GetIconBase64(file);
            string safePath = file.Replace("\\", "\\\\").Replace("\"", "\\\"");
            string name = Path.GetFileNameWithoutExtension(file).Replace("\"", "\\\"");
            string ext = Path.GetExtension(file).ToLower().Replace("\"", "\\\"");
            list.Add("{\"path\":\"" + safePath + "\",\"name\":\"" + name + "\",\"ext\":\"" + ext + "\",\"icon\":\"" + b64 + "\"}");
        }
        string json = "[" + string.Join(",", list) + "]";
        if (!string.IsNullOrEmpty(outputFilePath)) {
            try {
                File.WriteAllText(outputFilePath, json, Encoding.UTF8);
            } catch {}
        }
        return json;
    }
}
"@

try {
    Add-Type -TypeDefinition $win32Type -ReferencedAssemblies System.Drawing -ErrorAction SilentlyContinue
} catch {}

if ($Mode -eq "single" -and $Path) {
    $b64 = [NativeShellIcon]::GetIconBase64($Path)
    Write-Output $b64
}
elseif ($Mode -eq "directory" -and $Path) {
    $json = [NativeShellIcon]::ExtractDirectoryToJson($Path, $OutputFile)
    if (-not $OutputFile) {
        Write-Output $json
    }
}
elseif ($Mode -eq "list" -and $ListFile -and (Test-Path -LiteralPath $ListFile)) {
    $json = [NativeShellIcon]::ExtractListToJson($ListFile, $OutputFile)
    if (-not $OutputFile) {
        Write-Output $json
    }
}
