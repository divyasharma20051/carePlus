const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Small bounded multipart parser for the single resume file plus form fields.
// Limits requests to 5 MiB + small field overhead and allows only PDF/DOC/DOCX.
module.exports = async function resumeUpload(req, res, next) {
  if (!String(req.headers['content-type'] || '').toLowerCase().startsWith('multipart/form-data;')) return res.status(400).json({ message: 'Please submit the application using the resume upload form.' });
  const boundaryMatch = /boundary=(?:"([^"]+)"|([^;]+))/i.exec(req.headers['content-type']);
  if (!boundaryMatch) return res.status(400).json({ message: 'Invalid upload request.' });
  const boundary = Buffer.from(`--${boundaryMatch[1] || boundaryMatch[2]}`);
  const chunks = []; let total = 0; const maxRequest = 5 * 1024 * 1024 + 64 * 1024;
  try {
    for await (const chunk of req) {
      total += chunk.length;
      if (total > maxRequest) return res.status(413).json({ message: 'Resume must be smaller than 5 MB.' });
      chunks.push(chunk);
    }
    const body = Buffer.concat(chunks);
    const fields = {}; let resume = null; let cursor = 0;
    while (cursor < body.length) {
      const start = body.indexOf(boundary, cursor); if (start < 0) break;
      let partStart = start + boundary.length;
      if (body.slice(partStart, partStart + 2).toString() === '--') break;
      if (body.slice(partStart, partStart + 2).toString() === '\r\n') partStart += 2;
      const headerEnd = body.indexOf(Buffer.from('\r\n\r\n'), partStart); if (headerEnd < 0) break;
      const header = body.slice(partStart, headerEnd).toString('utf8');
      const dataStart = headerEnd + 4; let dataEnd = body.indexOf(boundary, dataStart); if (dataEnd < 0) break;
      if (body.slice(dataEnd - 2, dataEnd).toString() === '\r\n') dataEnd -= 2;
      const disposition = /content-disposition:\s*form-data;([^\r\n]+)/i.exec(header)?.[1] || '';
      const fieldName = /name="([^"]+)"/i.exec(disposition)?.[1];
      const filename = /filename="([^"]*)"/i.exec(disposition)?.[1];
      const part = body.slice(dataStart, dataEnd);
      if (fieldName === 'resume' && filename) {
        if (part.length > 5 * 1024 * 1024) return res.status(413).json({ message: 'Resume must be smaller than 5 MB.' });
        const ext = path.extname(filename).toLowerCase();
        if (!['.pdf', '.doc', '.docx'].includes(ext)) return res.status(400).json({ message: 'Only PDF, DOC or DOCX resumes are accepted.' });
        const mime = /content-type:\s*([^\r\n]+)/i.exec(header)?.[1]?.trim().toLowerCase() || '';
        const allowedMime = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/octet-stream'];
        if (mime && !allowedMime.includes(mime)) return res.status(400).json({ message: 'Unsupported resume file type.' });
        const filenameOnDisk = `${Date.now()}-${crypto.randomBytes(12).toString('hex')}${ext}`;
        const dir = path.join(__dirname, '..', 'uploads', 'resumes');
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, filenameOnDisk), part, { flag: 'wx' });
        resume = { filename: filenameOnDisk, originalName: path.basename(filename), mimeType: mime || 'application/octet-stream', size: part.length };
      } else if (fieldName) fields[fieldName] = part.toString('utf8').trim();
      cursor = dataEnd + (body.indexOf(boundary, dataEnd) === dataEnd ? 0 : 2);
      if (cursor <= start) cursor = start + boundary.length;
    }
    req.body = fields; req.resumeFile = resume; next();
  } catch (error) { next(error); }
};
