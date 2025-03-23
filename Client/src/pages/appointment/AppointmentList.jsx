import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-toastify';

const AppointmentList = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');
  
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        
        // Fetch all appointments first
        console.log('Fetching all appointments for appointment list');
        const response = await api.appointments.getAll();
        console.log('Appointments response:', response);
        
        if (response.data.success) {
          setAppointments(response.data.data || []);
        } else {
          setError('Failed to load appointments');
          setAppointments([]);
        }
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setError('Failed to load appointments: ' + (err.response?.data?.message || err.message));
        toast.error('Failed to load appointments');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  // Filter appointments based on active tab
  const filteredAppointments = appointments.filter(appointment => {
    switch (activeTab) {
      case 'upcoming':
        return appointment.status === 'scheduled';
      case 'completed':
        return appointment.status === 'completed';
      case 'missed':
        return appointment.status === 'no-show' || appointment.status === 'cancelled';
      default:
        return true;
    }
  });

  if (loading) {
    return <div className="flex justify-center p-8"><LoadingSpinner /></div>;
  }

  if (error) {
    return <div className="p-4 text-red-700">{error}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">My Appointments</h1>
      
      {/* Tab navigation */}
      <div className="mb-6 border-b">
        <nav className="flex space-x-4" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'upcoming'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'completed'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setActiveTab('missed')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'missed'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Cancelled/No-show
          </button>
        </nav>
      </div>
      
      {filteredAppointments.length > 0 ? (
        <div className="space-y-4">
          {filteredAppointments.map(appointment => (
            <div key={appointment._id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-medium">Dr. {appointment.doctor?.name || 'Unknown'}</h3>
                  <p className="text-gray-600 text-sm">
                    {new Date(appointment.date).toLocaleDateString()} at {appointment.time?.start}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    appointment.status === 'scheduled' ? 'bg-green-100 text-green-800' :
                    appointment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {appointment.status}
                  </span>
                  <div className="mt-2">
                    <Link to={`/appointments/${appointment._id}`} className="text-primary-600 text-sm">
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
              
              {/* Show Join Call button for video appointments within time window */}
              {appointment.type === 'video' && 
               appointment.status === 'scheduled' && 
               Math.abs((new Date(appointment.date) - new Date()) / (1000 * 60)) < 30 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <Link
                    to={`/video-preparation/${appointment._id}`}
                    className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-primary-600 text-white hover:bg-primary-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                      <path d="M14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                    </svg>
                    Join Call
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 p-8 text-center rounded-lg">
          <p className="text-gray-500 mb-4">No {activeTab} appointments found.</p>
          {activeTab === 'upcoming' && (
            <Link to="/find-doctor" className="px-4 py-2 bg-primary-600 text-white rounded-md">
              Find a Doctor
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default AppointmentList;