import multer from 'multer';

const upload = multer({ dest: 'uploads/' });
const uploadFile = upload.array('files', 7);

export default uploadFile;
