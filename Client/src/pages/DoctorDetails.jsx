import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorDisplay from "../components/common/ErrorDisplay";
import RatingStars from "../components/common/RatingStars";

const DoctorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Redirect doctors away from this page
    if (currentUser?.role === 'doctor') {
      navigate('/doctor/dashboard');
      return;
    }
    
    const fetchDoctorDetails = async () => {
      try {
        setLoading(true);
        const response = await api.doctors.getById(id);
        setDoctor(response.data.data);
        
        // Additionally check if doctor is accepting appointments
        try {
          const availResponse = await api.doctors.getAvailableDates(id);
          setDoctor(prev => ({
            ...prev,
            isAcceptingAppointments: availResponse.data.isAcceptingAppointments !== false
          }));
        } catch (e) {
          console.error("Error checking doctor availability:", e);
        }
      } catch (error) {
        console.error('Error fetching doctor details:', error);
        setError('Failed to load doctor information');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorDetails();
  }, [id, currentUser, navigate]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay message={error} />;
  if (!doctor) return <ErrorDisplay message="Doctor not found" />;

  return (
    <div className="p-4">
      <div className="mb-4">
        <button 
          onClick={() => navigate(-1)}
          className="text-primary-600 flex items-center mb-4"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex items-center">
            {doctor.profileImage ? (
              <img 
                src={doctor.profileImage} 
                alt={doctor.name} 
                className="w-24 h-24 rounded-full object-cover mr-6"
              />
            ) : (
              <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mr-6">
                <span className="text-primary-700 text-2xl font-bold">{doctor.name.charAt(0)}</span>
              </div>
            )}
            
            <div>
              <h1 className="text-2xl font-bold">Dr. {doctor.name}</h1>
              <p className="text-lg text-gray-600">{doctor.specialization}</p>
              <div className="flex items-center mt-1">
                <RatingStars rating={doctor.rating || 4.5} />
                <span className="ml-2 text-sm text-gray-500">({doctor.reviews?.length || 0} reviews)</span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              <span>{doctor.experience || '5+'} years experience</span>
            </div>
            
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-14a3 3 0 00-3 3v2H7a1 1 0 000 2h1v1a1 1 0 01-1 1 1 1 0 100 2h6a1 1 0 100-2H9.83c.11-.313.17-.65.17-1v-1h1a1 1 0 100-2h-1V7a1 1 0 112 0 1 1 0 102 0 3 3 0 00-3-3z" clipRule="evenodd" />
              </svg>
              <span>Consultation fee: ${doctor.consultationFee}</span>
            </div>
            
            {doctor.hospital?.name && (
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1.581.814l-4.419-2.95-4.419 2.95A1 1 0 014 16V4zm2-1a1 1 0 00-1 1v10.586l3.419-2.279a1 1 0 011.162 0L13 14.586V4a1 1 0 00-1-1H6z" clipRule="evenodd" />
                </svg>
                <span>{doctor.hospital.name}</span>
              </div>
            )}
            
            {doctor.licenseNumber && (
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>License: {doctor.licenseNumber}</span>
              </div>
            )}
          </div>
          
          {doctor.bio && (
            <div className="mt-6">
              <h2 className="text-lg font-medium mb-2">About</h2>
              <p className="text-gray-700">{doctor.bio}</p>
            </div>
          )}
          
          {doctor.isAcceptingAppointments === false && (
            <div className="mt-4 p-3 bg-amber-50 border-l-4 border-amber-400 text-amber-800 rounded-r">
              <h3 className="font-bold">Currently On Leave</h3>
              <p className="text-sm">This doctor is temporarily not accepting appointments.</p>
            </div>
          )}

          <div className="mt-8">
            <button
              onClick={() => navigate(`/book-appointment/${doctor._id}`)}
              className={`px-6 py-3 font-medium rounded-md ${
                doctor.isAcceptingAppointments !== false
                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                  : 'bg-gray-400 text-white cursor-not-allowed'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`}
              disabled={doctor.isAcceptingAppointments === false}
            >
              {doctor.isAcceptingAppointments !== false 
                ? 'Book Appointment' 
                : 'Doctor Currently On Leave'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDetails;