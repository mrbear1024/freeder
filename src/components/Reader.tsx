import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ePub from 'epubjs';
import { ArrowLeft, ArrowRight, Home } from 'lucide-react';

const Reader: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const viewerRef = useRef<HTMLDivElement>(null);
  const [book, setBook] = useState<any>(null);
  const [rendition, setRendition] = useState<any>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const url = params.get('url');

    if (!url) {
      navigate('/');
      return;
    }

    const loadBook = async () => {
      try {
        const newBook = ePub(url);
        setBook(newBook);

        const newRendition = newBook.renderTo(viewerRef.current!, {
          width: '100%',
          height: '100%',
          spread: 'auto',
        });
        setRendition(newRendition);

        await newRendition.display();
      } catch (error) {
        console.error('Error loading book:', error);
        alert('Error loading the e-book. Please check the URL and try again.');
        navigate('/');
      }
    };

    loadBook();

    return () => {
      if (book) {
        book.destroy();
      }
    };
  }, [location.search, navigate]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrevPage();
      } else if (e.key === 'ArrowRight') {
        goToNextPage();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [rendition]);

  const goToPrevPage = () => {
    if (rendition) {
      rendition.prev();
    }
  };

  const goToNextPage = () => {
    if (rendition) {
      rendition.next();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="bg-white shadow-md p-4 flex justify-between items-center">
        <button
          onClick={() => navigate('/')}
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          <Home className="w-5 h-5 mr-1" />
          Home
        </button>
        <div className="flex space-x-4">
          <button
            onClick={goToPrevPage}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            Previous
          </button>
          <button
            onClick={goToNextPage}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
          >
            Next
            <ArrowRight className="w-5 h-5 ml-1" />
          </button>
        </div>
      </div>
      <div ref={viewerRef} className="flex-grow overflow-auto" />
    </div>
  );
};

export default Reader;