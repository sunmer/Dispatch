import { useCallback } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { toast } from 'react-toastify';


export function FileUpload({ onFilesAccepted, maxFiles }: { onFilesAccepted: (files: File[]) => void, maxFiles: number }) {
  const onDrop = useCallback((files: File[]) => {
    onFilesAccepted(files);
  }, [onFilesAccepted]);

  const onDropRejected = useCallback((fileRejections: FileRejection[]) => {
    fileRejections.forEach(rejection => {
      if (rejection.errors.some(error => error.code === 'file-too-large')) {
        toast.error('File size exceeds the 1 MB limit');
      } else if (rejection.errors.some(error => error.code === 'file-invalid-type')) {
        toast.error('Only JPEG, PNG or GIF files are allowed');
      } else if (rejection.errors.some(error => error.code === 'too-many-files')) {
        toast.error(`You can only attach ${maxFiles} files at a time`);
      } else {
        toast.error('An error occurred while uploading');
      }
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    onDropRejected, 
    maxFiles: maxFiles,
    accept: {
      'image/*': ['.jpeg', '.png', '.gif']
    },
    maxSize: 3000000
  });

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      {
        isDragActive ?
          <p className="hover:underline hover:cursor-pointer">Drop your image here ...</p> :
          <p className="hover:underline hover:cursor-pointer">Attach images by clicking here</p>
      }
    </div>
  );
}
