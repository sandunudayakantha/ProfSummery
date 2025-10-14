# 📁 Cloudinary Document Upload Setup Guide

## Overview

Your Profit Summary App now supports document uploads using Cloudinary! Users can:
- Upload business logos (images)
- Upload legal documents (BR, Licenses, Certificates, etc.)
- Store PDFs, images, and Word documents
- View and download documents
- Delete documents (with proper permissions)

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Create Cloudinary Account

1. Go to [cloudinary.com/users/register/free](https://cloudinary.com/users/register/free)
2. Sign up for a **FREE** account (no credit card required)
3. You get:
   - ✅ 25GB storage
   - ✅ 25GB bandwidth/month
   - ✅ Unlimited transformations

### Step 2: Get Your Credentials

After signing up, you'll be on the Dashboard:

1. Look for the **Account Details** section
2. Copy these three values:
   - **Cloud Name** (e.g., `dxxxxxx`)
   - **API Key** (e.g., `123456789012345`)
   - **API Secret** (e.g., `abcdefghijklmnopqrstuvwxyz`)

### Step 3: Update .env File

Open `backend/.env` and add your Cloudinary credentials:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

**Example:**
```env
CLOUDINARY_CLOUD_NAME=dmycloud123
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=AbCdEfGhIjKlMnOpQrStUvWxYz
```

### Step 4: Restart Backend

```bash
cd backend
npm run dev
```

That's it! 🎉 Your document upload feature is now live!

---

## 📝 Features Implemented

### 1. Business Logo Upload
- **Who can upload**: Owner only
- **Supported formats**: JPG, PNG, GIF, WEBP
- **Max file size**: 5MB
- **Auto-resize**: Images are optimized to 1000x1000px max
- **Storage location**: `profit-summary/images/` folder in Cloudinary

### 2. Document Upload
- **Who can upload**: Owner and Editors
- **Supported formats**: PDF, JPG, PNG, DOC, DOCX
- **Max file size**: 10MB
- **Document types**:
  - BR (Business Registration)
  - License
  - Certificate
  - Contract
  - Other
- **Storage location**: `profit-summary/documents/` folder in Cloudinary

### 3. Document Management
- **View**: All roles (Owner, Editor, Viewer)
- **Upload**: Owner and Editor only
- **Delete**: Owner and Editor only
- **Download**: All roles

---

## 🎯 How Users Access It

### Frontend UI

1. **Login** to your account
2. **Select a business** from dashboard
3. **Click "Documents" tab**
4. **Upload Logo** (owner only, shown at top)
5. **Upload Documents** (click "+ Upload Document" button)
6. **View/Download** any document
7. **Delete** documents (if you're owner/editor)

### Document Tab Features

```
Documents Tab
├── Business Logo Section (Owner only)
│   ├── Upload/Change logo
│   └── Remove logo
└── Documents List
    ├── Upload new document
    ├── View documents
    ├── Download documents
    └── Delete documents
```

---

## 🔧 API Endpoints

### Logo Endpoints

```bash
# Upload business logo (Owner only)
POST /api/business/:id/documents/logo
Content-Type: multipart/form-data
Body: { logo: <file> }

# Delete business logo (Owner only)
DELETE /api/business/:id/documents/logo
```

### Document Endpoints

```bash
# Upload document (Owner/Editor)
POST /api/business/:id/documents
Content-Type: multipart/form-data
Body: { 
  document: <file>,
  name: "Document Name",
  type: "BR|License|Certificate|Contract|Other"
}

# Get all documents
GET /api/business/:id/documents

# Delete document (Owner/Editor)
DELETE /api/business/:id/documents/:documentId
```

---

## 📊 Database Schema Updates

### Business Model - New Fields

```javascript
{
  // ... existing fields
  
  logo: {
    url: String,        // Cloudinary URL
    publicId: String    // For deletion
  },
  
  documents: [{
    name: String,       // Document name
    type: String,       // BR, License, etc.
    url: String,        // Cloudinary URL
    publicId: String,   // For deletion
    fileType: String,   // pdf, jpg, png, etc.
    uploadedBy: ObjectId,
    uploadedAt: Date
  }]
}
```

---

## 🎨 Frontend Components

### New Components Created

1. **DocumentUpload.jsx**
   - Form for uploading documents
   - File validation
   - Document type selection
   - Progress indicator

2. **DocumentList.jsx**
   - Display all documents
   - View/Download buttons
   - Delete functionality
   - File type icons

3. **LogoUpload.jsx**
   - Logo preview
   - Upload/Change logo
   - Remove logo
   - Image validation

---

## 🔐 Security Features

### File Validation
- ✅ File type restrictions (images, PDFs, docs only)
- ✅ File size limits (5MB for images, 10MB for documents)
- ✅ Virus scanning (provided by Cloudinary)
- ✅ Secure URLs (HTTPS only)

### Permission Checks
- ✅ JWT authentication required
- ✅ Business access verification
- ✅ Role-based upload permissions
- ✅ Role-based delete permissions

### Cloudinary Security
- ✅ API credentials in environment variables
- ✅ Signed uploads
- ✅ Private API secret
- ✅ Folder organization

---

## 📁 File Organization in Cloudinary

Your files are organized like this:

```
Cloudinary Root
└── profit-summary/
    ├── images/
    │   ├── businessId-logo-timestamp1.jpg
    │   └── businessId-logo-timestamp2.png
    └── documents/
        ├── businessId-BR-timestamp1.pdf
        ├── businessId-License-timestamp2.jpg
        └── businessId-Contract-timestamp3.pdf
```

---

## 🧪 Testing the Feature

### Test Upload Flow

1. **Start the app**:
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

2. **Login and navigate**:
   - Go to http://localhost:3000
   - Login with your account
   - Select a business
   - Click "Documents" tab

3. **Upload a logo**:
   - Click "Upload Logo"
   - Select an image file
   - Should see preview immediately

4. **Upload a document**:
   - Click "+ Upload Document"
   - Fill in document name
   - Select document type (e.g., BR)
   - Choose a file (PDF or image)
   - Click "Upload Document"
   - Should appear in the list instantly

5. **Test view/download**:
   - Click "View" to open in new tab
   - Click "Download" to save file

6. **Test delete**:
   - Click "Delete" on a document
   - Confirm deletion
   - Document should be removed

---

## 🐛 Troubleshooting

### Error: "Cloudinary credentials not found"

**Solution**: Make sure your `backend/.env` has all three Cloudinary variables set.

```env
CLOUDINARY_CLOUD_NAME=your_value
CLOUDINARY_API_KEY=your_value
CLOUDINARY_API_SECRET=your_value
```

Then restart the backend server.

### Error: "File too large"

**Solution**: Check file sizes:
- Images (logo): Max 5MB
- Documents: Max 10MB

Compress your files if needed.

### Error: "Invalid file type"

**Solution**: Ensure you're uploading supported formats:
- **For logo**: JPG, PNG, GIF, WEBP
- **For documents**: PDF, JPG, PNG, DOC, DOCX

### Files not appearing in Cloudinary

**Solution**: 
1. Check your Cloudinary dashboard at cloudinary.com
2. Navigate to Media Library
3. Look for `profit-summary` folder
4. Files should be in `images/` or `documents/` subfolders

---

## 💰 Cloudinary Pricing (Free Tier)

Perfect for small to medium businesses:

| Feature | Free Tier Limit |
|---------|----------------|
| Storage | 25 GB |
| Bandwidth | 25 GB/month |
| Transformations | Unlimited |
| Image/Video Uploads | Unlimited |
| Price | $0 / month |

**When to upgrade:**
- If you exceed 25GB storage
- If you need more than 25GB bandwidth/month
- Paid plans start at $99/month

---

## 🔄 Migration to Another Storage Provider

If you want to use AWS S3, Google Cloud Storage, or Azure Blob Storage instead:

1. **Replace** `backend/config/cloudinary.js` with your storage config
2. **Update** the document controller to use your storage API
3. **Keep** the same endpoints and frontend code
4. **Environment variables** will change based on provider

---

## 📚 Additional Resources

- **Cloudinary Docs**: https://cloudinary.com/documentation
- **Node.js SDK**: https://cloudinary.com/documentation/node_integration
- **Multer Docs**: https://github.com/expressjs/multer
- **Image Transformations**: https://cloudinary.com/documentation/image_transformations

---

## ✅ Feature Checklist

- [x] Cloudinary integration
- [x] Logo upload (Owner only)
- [x] Document upload (Owner/Editor)
- [x] File type validation
- [x] File size limits
- [x] Document categorization (BR, License, etc.)
- [x] View documents
- [x] Download documents
- [x] Delete documents (Owner/Editor)
- [x] Role-based permissions
- [x] Responsive UI
- [x] Error handling
- [x] Success notifications

---

## 🎉 You're All Set!

Your Profit Summary App now has professional document management capabilities!

**Next steps:**
1. Set up your Cloudinary account
2. Add credentials to .env
3. Restart backend
4. Test uploads
5. Start managing your business documents! 📄

---

**Need help?** Check the main [README.md](./README.md) or [SETUP_GUIDE.md](./SETUP_GUIDE.md)

