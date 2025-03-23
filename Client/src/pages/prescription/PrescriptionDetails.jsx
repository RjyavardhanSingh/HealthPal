import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorDisplay from '../../components/common/ErrorDisplay';
import PrescriptionReminder from '../../components/prescription/PrescriptionReminder';

const PrescriptionDetails = () => {
  const { id } = useParams();
  const { currentUser, userToken } = useAuth();
  const navigate = useNavigate();
  
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showShared, setShowShared] = useState(false);

  useEffect(() => {
    const fetchPrescription = async () => {
      try {
        setLoading(true);
        
        if (!userToken) {
          setError('Authentication required');
          setLoading(false);
          return;
        }
        
        const response = await api.prescriptions.getById(id);
        setPrescription(response.data.data);
      } catch (err) {
        console.error('Error fetching prescription:', err);
        setError('Failed to load prescription details');
      } finally {
        setLoading(false);
      }
    };

    if (id && userToken) {
      fetchPrescription();
    }
  }, [id, userToken]);

  // Helper functions
  const isPrescriptionActive = () => {
    if (!prescription) return false;
    return new Date(prescription.expiryDate) >= new Date();
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };
  
  const handleShareClick = () => {
    setShowShared(true);
    setTimeout(() => setShowShared(false), 3000);
  };

  // Loading and error states
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !prescription) {
    return (
      <div>
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error || 'Prescription not found'}</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate('/prescriptions')}
          className="mt-4 text-primary-600 hover:text-primary-900 flex items-center"
        >
          <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Prescriptions
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 pb-16">
      {/* Share confirmation message */}
      {showShared && (
        <div className="fixed inset-x-0 top-20 flex justify-center z-50 animate-fade-in-down">
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md shadow-lg">
            <div className="flex">
              <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-medium">Prescription link copied to clipboard!</p>
                <p className="text-sm">You can now share it via messaging apps or email.</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="mb-6">
        <button
          onClick={() => navigate('/prescriptions')}
          className="text-primary-600 hover:text-primary-900 flex items-center"
        >
          <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Prescriptions
        </button>
      </div>

      {/* Main Prescription Card */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-6">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Prescription Details</h3>
            <p className="mt-1 text-sm text-gray-500">{formatDate(prescription.createdAt)}</p>
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            isPrescriptionActive() ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {isPrescriptionActive() ? 'Active' : 'Expired'}
          </span>
        </div>
        
        <div className="border-t border-gray-200">
          <div className="px-4 py-5 sm:p-6">
            {/* Doctor info */}
            <div className="mb-6">
              <h4 className="text-base font-medium text-gray-900 mb-3">Medical Provider</h4>
              <div className="flex items-start">
                {prescription.doctor.profileImage ? (
                  <img src={prescription.doctor.profileImage} alt={prescription.doctor.name} className="h-10 w-10 rounded-full object-cover mr-3" />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                    <span className="font-medium text-primary-700">{prescription.doctor.name.charAt(0)}</span>
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">Dr. {prescription.doctor.name}</p>
                  <p className="text-sm text-gray-500">{prescription.doctor.specialization}</p>
                </div>
              </div>
            </div>
            
            {/* Medications list */}
            <div className="mb-6">
              <h4 className="text-base font-medium text-gray-900 mb-3">Medications</h4>
              <div className="bg-gray-50 rounded-md p-4">
                <ul className="divide-y divide-gray-200">
                  {prescription.medications.map((medication, index) => (
                    <li key={index} className={index > 0 ? 'pt-4 mt-4' : ''}>
                      <div className="flex justify-between">
                        <div>
                          <h5 className="text-base font-medium text-gray-900">{medication.name}</h5>
                          <p className="text-sm text-gray-600 mt-1">{medication.dosage} - {medication.frequency}</p>
                        </div>
                        {medication.duration && <span className="text-sm text-gray-500">{medication.duration}</span>}
                      </div>
                      {medication.instructions && (
                        <p className="text-sm text-gray-600 mt-2">
                          <span className="font-medium">Instructions:</span> {medication.instructions}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Additional notes if available */}
            {prescription.notes && (
              <div className="mb-6">
                <h4 className="text-base font-medium text-gray-900 mb-2">Additional Notes</h4>
                <p className="text-gray-600">{prescription.notes}</p>
              </div>
            )}
            
            {/* Prescription validity period */}
            <div>
              <h4 className="text-base font-medium text-gray-900 mb-2">Valid Period</h4>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-gray-600">
                  From {formatDate(prescription.createdAt)} to {formatDate(prescription.expiryDate)}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="px-4 py-4 sm:px-6 border-t border-gray-200 flex justify-between">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <svg className="h-5 w-5 mr-2 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print
          </button>
          
          <button
            onClick={handleShareClick}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share
          </button>
        </div>
      </div>
      
      {/* Medication Schedule Card */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-6">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium text-gray-900">Medication Schedule</h3>
          <p className="mt-1 text-sm text-gray-500">Keep track of your medication routine</p>
        </div>
        
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <div className="space-y-4">
            {prescription.medications.map((medication, index) => (
              <div key={index} className={`p-4 rounded-md ${index % 2 === 0 ? 'bg-blue-50' : 'bg-purple-50'}`}>
                <h4 className="font-medium text-gray-900">{medication.name}</h4>
                <div className="mt-2">
                  <div className="flex items-center text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{medication.frequency}</span>
                  </div>
                  
                  {medication.instructions && (
                    <div className="flex items-start mt-2 text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{medication.instructions}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Related consultation card if available */}
      {prescription.consultation && (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium text-gray-900">Related Consultation</h3>
          </div>
          
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <Link 
              to={`/consultations/${prescription.consultation._id}`}
              className="block hover:bg-gray-50 rounded-md -m-2 p-2"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-base font-medium text-gray-900">
                    Consultation on {formatDate(prescription.consultation.date)}
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">
                    {prescription.consultation.diagnosis || 'General consultation'}
                  </p>
                </div>
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </Link>
          </div>
        </div>
      )}
      {currentUser.role === 'patient' && (
        <div className="mt-6">
          <div className="border-t pt-4">
            <PrescriptionReminder prescription={prescription} />
          </div>
        </div>
      )}
    </div>
  );
};

export default PrescriptionDetails;