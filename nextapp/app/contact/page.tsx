'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const ContactPage = () => {
  const { toast } = useToast();
  const [email] = useState('shovon2228@gmail.com');
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(email)
      .then(() => {
        setIsCopied(true);
        toast({
          title: 'Copied!',
          description: 'Email address copied to clipboard',
        });
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch((err) => {
        console.error('Failed to copy: ', err);
        toast({
          title: 'Error',
          description: 'Failed to copy email address',
          variant: 'destructive',
        });
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Contact Me</h1>
            <p className="text-gray-600">
              Have questions, issues, or feature requests? Get in touch!
            </p>
          </div>

          <div className="space-y-6">
            <div className="text-center">
              <p className="text-gray-700 mb-4">
                Feel free to reach out to me for any of the following:
              </p>
              <ul className="space-y-2 text-left max-w-md mx-auto">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span>Reporting bugs or technical issues</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span>Payment problems or billing questions</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span>Feature requests or suggestions</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span>General inquiries or feedback</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col items-center p-6 bg-blue-50 rounded-lg">
              <p className="text-gray-700 mb-4">Send me an email at:</p>
              <div className="flex items-center">
                <span className="text-xl font-semibold text-blue-600 break-all">
                  {email}
                </span>
                <button
                  onClick={copyToClipboard}
                  className={`ml-4 px-4 py-2 rounded-md font-medium transition-colors ${
                    isCopied
                      ? 'bg-green-500 text-white'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {isCopied ? 'Copied!' : 'Copy Email'}
                </button>
              </div>
            </div>

            <div className="text-center text-gray-500 text-sm">
              <p>
                I'll do my best to respond to your inquiries as soon as possible.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;