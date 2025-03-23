import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorDisplay from '../../components/common/ErrorDisplay';
import StarRating from '../../components/common/RatingStars';
import { useAuth } from '../../context/AuthContext';

const FindDoctor = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    // Redirect doctors away from this page
    if (currentUser?.role === 'doctor') {
      navigate('/doctor/dashboard');
    }
  }, [currentUser, navigate]);

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useState({
    name: '',
    specialization: location.state?.specialty || '',
    location: '',
    availability: '',
    gender: '',
    experience: '',
    feeRange: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const response = await api.doctors.getAll(searchParams);
        setDoctors(response.data.data || []);
      } catch (err) {
        console.error("Error fetching doctors:", err);
        setError(err.message || "Failed to load doctors");
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [searchParams]);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.doctors.getAll(searchParams);
      setDoctors(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error("Error searching doctors:", err);
      setError(err.message || "Failed to search doctors");
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name]: value }));
  };
  
  const getSoonestAvailability = (doctor) => {
    // Logic to determine soonest available appointment
    // For now, just returning a placeholder
    return "Today";
  };

  return (
    <div className="p-4 pb-16">
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <form onSubmit={handleSearch} className="space-y-4 md:space-y-0 md:flex md:space-x-4">
          <div className="flex-grow">
            <input
              type="text"
              name="name"
              placeholder="Search doctor by name"
              value={searchParams.name}
              onChange={handleInputChange}
              className="w-full p-3 border rounded-lg"
            />
          </div>
          
          <div className="flex-grow">
            <select
              name="specialization"
              value={searchParams.specialization}
              onChange={handleInputChange}
              className="w-full p-3 border rounded-lg"
            >
              <option value="">All Specialties</option>
              <option value="Cardiologist">Cardiologist</option>
              <option value="Dermatologist">Dermatologist</option>
              <option value="Neurologist">Neurologist</option>
              <option value="Orthopedic">Orthopedic</option>
              <option value="Pediatrician">Pediatrician</option>
              <option value="Psychiatrist">Psychiatrist</option>
              <option value="General Physician">General Physician</option>
            </select>
          </div>
          
          <div>
            <button 
              type="submit" 
              className="w-full md:w-auto bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
            >
              Search
            </button>
          </div>
          
          <div>
            <button 
              type="button" 
              onClick={() => setShowFilters(!showFilters)}
              className="w-full md:w-auto bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200"
            >
              Filters {showFilters ? '▲' : '▼'}
            </button>
          </div>
        </form>
        
        {showFilters && (
          <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                name="location"
                placeholder="Any location"
                value={searchParams.location}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                name="gender"
                value={searchParams.gender}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              >
                <option value="">Any</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
              <select
                name="experience"
                value={searchParams.experience}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              >
                <option value="">Any</option>
                <option value="0-5">0-5 years</option>
                <option value="5-10">5-10 years</option>
                <option value="10+">10+ years</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fee Range</label>
              <select
                name="feeRange"
                value={searchParams.feeRange}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              >
                <option value="">Any</option>
                <option value="0-100">$0-$100</option>
                <option value="100-200">$100-$200</option>
                <option value="200+">$200+</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <ErrorDisplay message={error} />
      ) : doctors.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <div className="mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-600 mb-4">No doctors found matching your search criteria.</p>
          <button 
            onClick={() => setSearchParams({
              name: '',
              specialization: '',
              location: '',
              availability: '',
              gender: '',
              experience: '',
              feeRange: ''
            })}
            className="text-primary-600 font-medium hover:text-primary-700"
          >
            Clear filters and try again
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {doctors.map((doctor) => (
            <div key={doctor._id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition">
              <div className="p-4 flex flex-col sm:flex-row">
                <div className="sm:mr-6 mb-4 sm:mb-0 flex-shrink-0">
                  {doctor.profileImage ? (
                    <img 
                      src={doctor.profileImage} 
                      alt={doctor.name} 
                      className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-primary-600 text-2xl font-bold">
                        {doctor.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex-grow">
                  <div className="flex flex-col sm:flex-row sm:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Dr. {doctor.name}</h3>
                      <p className="text-sm text-gray-600 mb-1">{doctor.specialization}</p>
                      <div className="flex items-center mb-1">
                        <StarRating rating={doctor.rating || 4.5} />
                        <span className="ml-1 text-sm text-gray-600">({doctor.reviews?.length || 0})</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{doctor.experience || '5+ years'} of experience</p>
                      <p className="text-sm text-gray-600">${doctor.consultationFee} per consultation</p>
                    </div>
                    
                    <div className="mt-4 sm:mt-0">
                      {doctor.isAcceptingAppointments === false ? (
                        <div className="flex items-center bg-amber-50 text-amber-800 px-3 py-1 rounded-full text-sm mb-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <span>Currently On Leave</span>
                        </div>
                      ) : (
                        <div className="flex items-center bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm mb-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>Available: {getSoonestAvailability(doctor)}</span>
                        </div>
                      )}
                      
                      <button 
                        onClick={() => navigate(`/doctors/${doctor._id}`)}
                        className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
                      >
                        View Profile
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FindDoctor;