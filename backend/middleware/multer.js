import path from 'path';
import multer from "multer";

const storage = multer.diskStorage({
    filename: function(req, file, callback) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const basename = path.basename(file.originalname, ext);
        callback(null, basename + '-' + uniqueSuffix + ext);
    }
});

const upload = multer({storage})

const uploadFields = upload.fields([
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 },
  { name: 'image3', maxCount: 1 },
  { name: 'image4', maxCount: 1 },
]);

export default upload;
export { uploadFields };
