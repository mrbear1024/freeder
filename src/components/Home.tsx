import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, Upload } from 'lucide-react';
import { uploadToR2, listBooks, getSignedR2Url } from '../utils/r2Utils';

const Home: React.FC = () => {
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploadedBooks, setUploadedBooks] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUploadedBooks();
  }, []);

  const fetchUploadedBooks = async () => {
    try {
      const books = await listBooks();
      setUploadedBooks(books);
    } catch (error) {
      console.error('Error fetching uploaded books:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (url) {
      navigate(`/reader?url=${encodeURIComponent(url)}`);
    } else if (file) {
      try {
        const uploadedFileName = await uploadToR2(file);
        const signedUrl = await getSignedR2Url(uploadedFileName);
        navigate(`/reader?url=${encodeURIComponent(signedUrl)}`);
      } catch (error) {
        console.error('Error uploading file:', error);
        alert('Error uploading file. Please try again.');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUrl('');
    }
  };

  const openBook = async (bookName: string) => {
    try {
      const signedUrl = await getSignedR2Url(bookName);
      navigate(`/reader?url=${encodeURIComponent(signedUrl)}`);
    } catch (error) {
      console.error('Error opening book:', error);
      alert('Error opening book. Please try again.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-md mb-8">
        <div className="flex items-center justify-center mb-6">
          <Book className="w-12 h-12 text-blue-500 mr-2" />
          <h1 className="text-3xl font-bold text-gray-800">E-Book Reader</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700">
              Enter E-Book URL (EPUB format)
            </label>
            <input
              type="url"
              id="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setFile(null);
              }}
              placeholder="https://example.com/book.epub"
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center justify-center w-full">
            <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-2 text-gray-500" />
                <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                <p className="text-xs text-gray-500">EPUB file (max. 100MB)</p>
              </div>
              <input
                id="file-upload"
                type="file"
                accept=".epub"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
          {file && (
            <p className="text-sm text-gray-600">Selected file: {file.name}</p>
          )}
          <button
            type="submit"
            disabled={!url && !file}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Open E-Book
          </button>
        </form>
      </div>
      
      {uploadedBooks.length > 0 && (
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Uploaded Books</h2>
          <ul className="space-y-2">
            {uploadedBooks.map((book, index) => (
              <li key={index}>
                <button
                  onClick={() => openBook(book)}
                  className="text-blue-600 hover:text-blue-800 focus:outline-none"
                >
                  {book}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Home;