# 📚 Quiz คำยืมจากภาษาจีน — Vercel + KV

## โครงสร้างไฟล์
```
quiz-chinese/          ← root ของ GitHub repo
├── api/
│   └── score.js       ← Serverless Function (เก็บ/ดึงคะแนน)
├── public/
│   ├── home.html      ← Leaderboard real-time
│   ├── q1.html
│   └── ... q20.html
├── vercel.json        ← routing config
└── README.md
```

---

## 🚀 วิธี Deploy (GitHub + Vercel)

### ขั้นที่ 1 — สร้าง GitHub Repo
1. ไป **github.com** → กด **New repository**
2. ตั้งชื่อ เช่น `quiz-chinese` → Create
3. กด **uploading an existing file** → ลาก **ทุกไฟล์ใน quiz-chinese/** ขึ้นไป
   - ต้องมีทั้ง `api/` , `public/` , `vercel.json`
4. กด **Commit changes**

### ขั้นที่ 2 — Import บน Vercel
1. ไป **vercel.com** → Dashboard → **Add New Project**
2. เลือก **Import Git Repository** → เลือก repo `quiz-chinese`
3. **อย่าเปลี่ยน** settings อะไร → กด **Deploy**
4. รอ ~1 นาที → ได้ URL เช่น `https://quiz-chinese.vercel.app`

### ขั้นที่ 3 — เชื่อม KV Store (สำคัญมาก!)
1. ใน Vercel Dashboard → เลือก project → แท็บ **Storage**
2. กด **Create Database** → เลือก **KV** → ตั้งชื่อ → **Create & Continue**
3. กด **Connect to Project** → เลือก project ที่ deploy ไว้ → **Connect**
4. Vercel จะ inject env vars ให้อัตโนมัติ:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
5. กลับไปที่ **Deployments** → กด **Redeploy** (สำคัญ! ต้อง redeploy ให้ env vars มีผล)

### ขั้นที่ 4 — ทดสอบ
เปิด URL:
- `https://quiz-chinese.vercel.app/q1.html` → ต้องเห็นข้อสอบ
- `https://quiz-chinese.vercel.app/home.html` → ต้องเห็น Leaderboard
- `https://quiz-chinese.vercel.app/api/score` → ต้องได้ JSON `{"ok":true,...}`

---

## 🎮 ใช้งานใน ZEP

ใส่ URL ใน Object แต่ละจุด:
```
ข้อ 1  →  https://quiz-chinese.vercel.app/q1.html
ข้อ 2  →  https://quiz-chinese.vercel.app/q2.html
...
ข้อ 20 →  https://quiz-chinese.vercel.app/q20.html
หน้าหลัก → https://quiz-chinese.vercel.app/home.html
```

---

## 🔑 รหัสครูสำหรับรีเซ็ตคะแนน
default: **1234**

เปลี่ยนได้ที่ `public/home.html` บรรทัด:
```js
if(pw!=='1234') return;
```
