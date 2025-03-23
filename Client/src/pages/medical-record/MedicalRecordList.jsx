import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorDisplay from '../../components/common/ErrorDisplay';
import FileUpload from '../../components/common/FileUpload';

const MedicalRecordList = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRecord, setNewRecord] = useState({
    title: '',
    description: '',
    recordType: 'other',
    files: []
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMedicalRecords = async () => {
      try {
        setLoading(true);
        const response = await api.medicalRecords.getAll();
        setRecords(response.data.data || []);
      } catch (err) {
        console.error('Error fetching medical records:', err);
        setError('Failed to load medical records');
      } finally {
        setLoading(false);
      }
    };

    fetchMedicalRecords();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRecord(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = (fileUrl, fileName, fileType) => {
    setNewRecord(prev => ({
      ...prev,
      files: [...prev.files, {
        url: fileUrl,
        name: fileName || 'Uploaded file',
        fileType: fileType || 'application/pdf'
      }]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.medicalRecords.create(newRecord);
      setRecords(prev => [response.data.data, ...prev]);
      setShowCreateModal(false);
      setNewRecord({
        title: '',
        description: '',
        recordType: 'other',
        files: []
      });
    } catch (err) {
      console.error('Error creating medical record:', err);
      setError('Failed to create medical record');
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><LoadingSpinner /></div>;
  }

  if (error) {
    return <div className="p-4 text-red-700">{error}</div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Medical Records</h1>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add New Record
        </button>
      </div>
      
      {records.length > 0 ? (
        <div className="space-y-4">
          {records.map(record => (
            <div key={record._id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-medium">{record.title}</h3>
                  <p className="text-gray-600 text-sm">
                    Date: {new Date(record.date).toLocaleDateString()}
                    {record.doctor && <span> | Doctor: Dr. {record.doctor.name}</span>}
                  </p>
                  {record.files && record.files.length > 0 && (
                    <div className="mt-2 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs text-gray-500">{record.files.length} attachment{record.files.length !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <Link to={`/medical-records/${record._id}`} className="text-primary-600 text-sm">
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 p-8 text-center rounded-lg">
          <p className="text-gray-500 mb-4">You don't have any medical records yet.</p>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Create Your First Record
          </button>
        </div>
      )}

      {/* Create Record Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowCreateModal(false)}></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Medical Record</h3>
                  
                  <div className="mb-4">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={newRecord.title}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="recordType" className="block text-sm font-medium text-gray-700 mb-1">
                      Record Type *
                    </label>
                    <select
                      id="recordType"
                      name="recordType"
                      value={newRecord.recordType}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    >
                      <option value="lab_result">Lab Result</option>
                      <option value="prescription">Prescription</option>
                      <option value="diagnosis">Diagnosis</option>
                      <option value="imaging">Imaging</option>
                      <option value="vaccination">Vaccination</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={newRecord.description}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      rows="3"
                      required
                    ></textarea>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Upload Files
                    </label>
                    <FileUpload 
                      type="document"
                      onUploadSuccess={(url, metadata) => handleFileUpload(url, metadata?.name, metadata?.type)}
                    />
                  </div>
                  
                  {newRecord.files.length > 0 && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Uploaded Files
                      </label>
                      <ul className="border rounded-md divide-y">
                        {newRecord.files.map((file, index) => (
                          <li key={index} className="p-2 flex justify-between items-center">
                            <div className="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span className="text-sm">{file.name || 'File ' + (index + 1)}</span>
                            </div>
                            <button
                              type="button"
                              className="text-red-600 hover:text-red-800"
                              onClick={() => {
                                setNewRecord(prev => ({
                                  ...prev,
                                  files: prev.files.filter((_, i) => i !== index)
                                }));
                              }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Create Record
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalRecordList;