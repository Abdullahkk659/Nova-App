import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { uploadPostMedia } from '../firebase/storage'
import { createPost } from '../firebase/firestore'
import toast from 'react-hot-toast'

export default function NewPostModal() {
  const { user, profile } = useAuth()
  const [open, setOpen] = useState(false)
  const [files, setFiles] = useState([])
  const [previews, setPreviews] = useState([])
  const [caption, setCaption] = useState('')
  const [location, setLocation] = useState('')
  const [tags, setTags] = useState('')
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const fileRef = useRef()

  useEffect(() => {
    const handler = () => setOpen(true)
    document.addEventListener('nova:open-post-modal', handler)
    return () => document.removeEventListener('nova:open-post-modal', handler)
  }, [])

  const handleFiles = (selected) => {
    const arr = Array.from(selected).slice(0, 10)
    setFiles(arr)
    setPreviews(arr.map(f => ({
      url: URL.createObjectURL(f),
      type: f.type.startsWith('video') ? 'video' : 'image'
    })))
  }

  const handleDrop = (e) => {
    e.preventDefault()
    handleFiles(e.dataTransfer.files)
  }

  const handleSubmit = async () => {
    if (!user || files.length === 0) {
      toast.error('Add at least one photo or video')
      return
    }
    setUploading(true)
    try {
      // Upload all files to Cloudinary
      const uploads = []
      for (let i = 0; i < files.length; i++) {
        const result = await uploadPostMedia(files[i], user.uid, (p) => {
          setProgress(Math.round((i / files.length) * 100 + p / files.length))
        })
        uploads.push(result)
      }

      // Clean tags
      const tagArr = tags.trim()
        ? tags.split(/[\s,]+/).filter(t => t).map(t => t.startsWith('#') ? t : '#' + t)
        : []

      // Build post — strip out any undefined values so Firestore doesn't complain
      const postData = {
        authorId:       user.uid,
        authorName:     profile?.displayName || profile?.username || user.email || 'User',
        authorUsername: profile?.username || '',
        authorAvatar:   profile?.avatarUrl  || '',
        authorVerified: profile?.isVerified || false,
        mediaUrls:      uploads.map(u => u.url),        // Cloudinary secure_url
        mediaPublicIds: uploads.map(u => u.publicId),   // Cloudinary public_id
        mediaType:      files[0].type.startsWith('video') ? 'video' : 'image',
        caption:        caption.trim() || '',
        location:       location.trim() || '',
        tags:           tagArr,
      }

      await createPost(postData)
      toast.success('Post shared! ✦')
      setOpen(false)
      setFiles([])
      setPreviews([])
      setCaption('')
      setLocation('')
      setTags('')
      setProgress(0)
    } catch (err) {
      console.error('Post error:', err)
      toast.error('Failed to post: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  if (!open) return null

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#00000099', zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}>
      <div className="card animate-fade-up" style={{ width: 520, maxWidth: '92vw', maxHeight: '90vh', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 600 }}>New Post</span>
          <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 22, padding: '2px 8px', lineHeight: 1 }}>×</button>
        </div>

        {/* Upload zone or previews */}
        {previews.length === 0 ? (
          <div
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => fileRef.current.click()}
            style={{
              margin: '16px 18px', border: '1.5px dashed var(--border3)',
              borderRadius: 14, padding: '36px 20px', textAlign: 'center',
              cursor: 'pointer', transition: 'all .15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)66'; e.currentTarget.style.background = '#c9a84c08' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border3)'; e.currentTarget.style.background = 'transparent' }}
          >
            <div style={{ fontSize: 36, marginBottom: 8 }}>🖼️</div>
            <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text2)' }}>Drop photos or videos here</div>
            <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 4 }}>JPG, PNG, MP4, MOV · Up to 10 files</div>
            <input ref={fileRef} type="file" accept="image/*,video/*" multiple style={{ display: 'none' }}
              onChange={e => handleFiles(e.target.files)} />
          </div>
        ) : (
          <div style={{ padding: '12px 18px' }}>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
              {previews.map((p, i) => (
                <div key={i} style={{ position: 'relative', flexShrink: 0 }}>
                  {p.type === 'video'
                    ? <video src={p.url} style={{ width: 90, height: 90, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--border)' }} />
                    : <img src={p.url} alt="" style={{ width: 90, height: 90, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--border)' }} />
                  }
                  <button
                    onClick={() => {
                      const f = [...files]; f.splice(i, 1); setFiles(f)
                      const pv = [...previews]; pv.splice(i, 1); setPreviews(pv)
                    }}
                    style={{ position: 'absolute', top: 4, right: 4, background: '#000000aa', border: 'none', color: '#fff', borderRadius: '50%', width: 20, height: 20, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>×</button>
                </div>
              ))}
              {/* Add more button */}
              <div onClick={() => fileRef.current.click()} style={{ width: 90, height: 90, borderRadius: 10, border: '1.5px dashed var(--border3)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text3)', flexShrink: 0, fontSize: 28 }}>+</div>
              <input ref={fileRef} type="file" accept="image/*,video/*" multiple style={{ display: 'none' }}
                onChange={e => handleFiles(e.target.files)} />
            </div>
          </div>
        )}

        {/* Fields */}
        <div style={{ padding: '0 18px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <textarea
            className="input" value={caption} onChange={e => setCaption(e.target.value)}
            placeholder="Write a caption…" rows={3} maxLength={2200}
            style={{ resize: 'none', lineHeight: 1.5 }}
          />
          <input className="input" value={location} onChange={e => setLocation(e.target.value)}
            placeholder="Add location…" style={{ height: 40 }} />
          <input className="input" value={tags} onChange={e => setTags(e.target.value)}
            placeholder="Add tags  #photography #travel" style={{ height: 40 }} />
        </div>

        {/* Upload progress */}
        {uploading && (
          <div style={{ padding: '0 18px 12px' }}>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 4 }}>
              Uploading… {progress}%
            </div>
            <div className="upload-progress-bar">
              <div className="upload-progress-bar-fill" style={{ width: progress + '%' }} />
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '12px 18px', borderTop: '1px solid var(--border)' }}>
          <button className="btn btn-outline" onClick={() => setOpen(false)} disabled={uploading}>Cancel</button>
          <button className="btn btn-gold" onClick={handleSubmit} disabled={uploading || files.length === 0}>
            {uploading ? 'Sharing…' : 'Share Post'}
          </button>
        </div>

      </div>
    </div>
  )
}
