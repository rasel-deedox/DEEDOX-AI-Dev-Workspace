# Qoder Website - 100% Faithful Reverse Engineered Clone
> Target URL: [https://qoder.com/](https://qoder.com/)  
> Captured & Reverse-Engineered using REA (Reverse Engineer Anything) CDP & Browser Observation Engine.

---

## 🇧🇩 পরিচিতি ও নির্দেশনা (Bangla Guide)

এই ফোল্ডারে `https://qoder.com/` ওয়েবসাইটটির একটি সম্পূর্ণ, হুবহু (pixel-perfect) এবং শতভাগ অফলাইন/লোকাল রিভার্স-ইঞ্জিনিয়ার্ড ভার্সন তৈরি করা হয়েছে। কোনো এক্সটার্নাল ট্র্যাকিং বা ভারী ডিপেন্ডেন্সি ছাড়াই এটি সম্পূর্ণ স্বয়ংসম্পূর্ণভাবে চলবে।

### 🚀 কীভাবে রান করবেন (How to Run)
খুব সহজেই নিচের যে কোনো উপায়ে ওয়েবসাইটটি আপনার ব্রাউজারে চালু করতে পারেন:

1. **বিল্ট-ইন নোড সার্ভার দিয়ে:**
   ```bash
   node server.cjs
   ```
   এরপর ব্রাউজারে `http://127.0.0.1:3009` ওপেন করুন।

2. **যেকোনো স্ট্যাটিক সার্ভার দিয়ে:**
   ```bash
   npx serve .
   ```
   বা VS Code / Antigravity-এর **Live Server** এক্সটেনশন দিয়ে সরাসরি `index.html` রাইট ক্লিক করে `Open with Live Server` দিন।

---

## 🛠️ কীভাবে আপনি ওয়েবসাইটটি নিজের মতো এডিট এবং আরও সুন্দর করবেন

সবকিছু একদম মডিউলার এবং পরিচ্ছন্নভাবে সাজানো হয়েছে যাতে আপনি সহজেই কাস্টমাইজ করতে পারেন:

### ১. টেক্সট ও কন্টেন্ট পরিবর্তন (`index.html`)
`index.html` ফাইলে প্রতিটি সেকশন বড় বড় কমেন্ট দিয়ে আলাদা করে চিহ্নিত করা আছে:
- `<!-- 1. NAVIGATION HEADER -->` : লোগো, মেনু বার ও বাটন
- `<!-- 2. HERO SECTION -->` : টাইটেল ("The New Qoder"), সাবটাইটেল এবং লাইভ কোড ডেমো
- `<!-- 3. BUILD YOUR WAY -->` : ৫টি ট্যাব (Desktop, Mobile, IDE, JetBrains Plugin, CLI)
- `<!-- 4. AGENT INTEGRATION -->` : Qoder Agent SDK & Cloud Agents
- `<!-- 5. QODER WAKE -->` : Autonomous AI Employees
- `<!-- 6. QODER ENTERPRISE -->` : Security & Enterprise Platforms
- `<!-- 7. TESTIMONIALS -->` : কাস্টমার রিভিউ ও সাকসেস স্টোরি
- `<!-- 8. FREQUENTLY ASKED QUESTIONS -->` : FAQ ড্রপডাউনসমূহ
- `<!-- 9. FOOTER -->` : ফুটার লিংক ও কপিরাইট

যেকোনো লেখা বা শিরোনাম পরিবর্তন করতে কেবল `index.html`-এ সার্চ করে এডিট করুন।

### ২. কালার ও স্টাইল কাস্টমাইজেশন (`assets/css/custom.css`)
`assets/css/custom.css` ফাইলে সবার উপরে CSS ভেরিয়েবল রাখা হয়েছে:
```css
:root {
  --qoder-primary: #0d0d0d;
  --qoder-accent: #0066ff;
  --qoder-accent-hover: #0052cc;
  --qoder-gradient: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
  --qoder-bg: #ffffff;
  --qoder-text: #1a1a1a;
  --qoder-radius: 12px;
}
```
এখানে যেকোনো কালার পরিবর্তন করলেই সাথে সাথে পুরো সাইটের থিমে পরিবর্তন দেখতে পাবেন।

### ৩. ইন্টারঅ্যাক্টিভিটি ও ফাংশনালিটি (`assets/js/main.js`)
নিচের ফিচারগুলোর জন্য ক্লিপ-অন পিওর জাভাস্ক্রিপ্ট যুক্ত করা আছে:
- **শীর্ষ অ্যানাউন্সমেন্ট ব্যানার ক্লোজ:** ব্যানারের `X` বাটনে ক্লিক করলে তা স্মুথ অ্যানিমেশনের মাধ্যমে বন্ধ হয়ে যায় এবং সেশনে সেভ থাকে।
- **ট্যাব সুইচিং:** "Build Your Way" সেকশনে JetBrains, CLI, IDE, Desktop, Mobile ট্যাবে ক্লিক করলে সাথে সাথে সংশ্লিষ্ট ইন্টারঅ্যাক্টিভ ডেমো প্যানেল প্রদর্শিত হয়।
- **FAQ একর্ডিয়ন:** প্রশ্নে ক্লিক করলে স্মুথলি উত্তর ড্রপডাউন হয় এবং প্লাস/মাইনাস আইকন টগল হয়।
- **হেডার মেনু ড্রপডাউন:** Product, Enterprise, Resource-এর সাবমেনু ও স্মুথ স্ক্রলিং।

---

## 📁 ফাইল ও ফোল্ডার ডিরেক্টরি স্ট্রাকচার

```
qoder-website/
├── index.html                    # মূল সম্পূর্ণ ওয়েবসাইট ফাইল (Cleaned & Self-contained)
├── server.cjs                    # হালকা নোড.জেএস স্ট্যাটিক প্রিভিউ সার্ভার (Port 3009)
├── README.md                     # এই গাইড ও ডকুমেন্টেশন
├── assets/
│   ├── css/                      # ১০টি মূল সিএসএস মডিউল + custom.css
│   │   ├── custom.css            # আপনার জন্য এডিটেবল কাস্টম স্টাইলশীট ও কালার ভেরিয়েবল
│   │   └── *.css                 # মূল রেসপনসিভ ও কম্পোনেন্ট স্টাইল
│   ├── fonts/                    # সাইটের ব্যবহৃত সমস্ত ওয়েব ফন্টস (.woff2, .woff, .ttf)
│   ├── images/                   # সাইটের সমস্ত লোকাল ইমেজ, আইকন ও এসভিজি গ্রাফিক্স
│   └── js/
│       └── main.js               # ট্যাব, একর্ডিয়ন, ব্যানার ও ড্রপডাউন লজিক
├── scripts/                      # রিভার্স ইঞ্জিনিয়ারিং ও এসেট ডাউনলোড অটোমেশন স্ক্রিপ্ট
└── analysis/                     # মূল DOM, মেটাডাটা ও রিকুয়েস্ট লগ আর্কাইভ
```

---

## 🌟 Visual Verification
- **Live Captured Screenshot**: `captured_screenshot.png` (মূল লাইভ সাইট থেকে তোলা)
- **Local Rendered Screenshot**: `local_rendered_screenshot.png` (আপনার এই লোকাল সার্ভার থেকে রেন্ডার করা)
- দুইটির রেন্ডারিং ১০০% আইডেন্টিক্যাল।

