import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const AppointmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        setLoading(true);
        const response = await api.appointments.getById(id);
        setAppointment(response.data.data);
      } catch (err) {
        console.error('Error fetching appointment:', err);
        setError('Failed to load appointment details');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [id]);

  const handleCancelAppointment = async () => {
    try {
      await api.appointments.cancel(id, cancellationReason);
      toast.success('Appointment canceled successfully');
      setShowCancelModal(false);
      
      // Refresh appointment data
      const response = await api.appointments.getById(id);
      setAppointment(response.data.data);
    } catch (err) {
      console.error('Error canceling appointment:', err);
      toast.error('Failed to cancel appointment');
    }
  };

  const handleJoinVideoCall = () => {
    if (!appointment._id) {
      toast.error('Appointment ID not found');
      return;
    }
    navigate(`/video-preparation/${appointment._id}`);
  };

  const isVideoAppointment = appointment && appointment.type === 'video';
  const isScheduled = appointment && appointment.status === 'scheduled';

  // Create appointment time with proper time component
  const appointmentTime = appointment ? new Date(appointment.date) : null;
  const currentTime = new Date();

  // Add the time component from appointment.time.start
  if (appointmentTime && appointment.time && appointment.time.start) {
    const [hours, minutes] = appointment.time.start.split(':').map(Number);
    appointmentTime.setHours(hours, minutes, 0, 0);
  }

  const timeDifference = appointmentTime ? (appointmentTime - currentTime) / (1000 * 60) : null;
  const isWithinTimeWindow = timeDifference !== null && Math.abs(timeDifference) < 30; // 30 min window

  const canJoinConsultation = isVideoAppointment && isScheduled && isWithinTimeWindow;

  if (loading) {
    return <div className="flex justify-center p-8"><LoadingSpinner /></div>;
  }

  if (error) {
    return <div className="p-4 text-red-700">{error}</div>;
  }

  if (!appointment) {
    return <div className="p-4">Appointment not found</div>;
  }

  const isPastAppointment = new Date(appointment.date) < new Date();
  const canCancel = appointment.status === 'scheduled' && !isPastAppointment;

  return (
    <div className="p-4">
      <button onClick={() => navigate(-1)} className="flex items-center text-primary-600 mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Back
      </button>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Appointment Details</h1>
          
          <div className="flex justify-between mb-4">
            <div>
              <span className={`px-3 py-1 text-sm rounded-full ${
                appointment.status === 'scheduled' ? 'bg-green-100 text-green-800' :
                appointment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                'bg-red-100 text-red-800'
              }`}>
                {appointment.status}
              </span>
            </div>
            
            {canCancel && (
              <button 
                onClick={() => setShowCancelModal(true)}
                className="px-3 py-1 bg-red-600 text-white rounded-md text-sm"
              >
                Cancel Appointment
              </button>
            )}
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-gray-500 text-sm">Doctor</h3>
                <p className="font-medium">Dr. {appointment.doctor?.name || 'Unknown'}</p>
              </div>
              
              <div>
                <h3 className="text-gray-500 text-sm">Date & Time</h3>
                <p className="font-medium">
                  {new Date(appointment.date).toLocaleDateString()} at {appointment.time?.start}
                </p>
              </div>
              
              <div>
                <h3 className="text-gray-500 text-sm">Type</h3>
                <p className="font-medium">
                  {appointment.type === 'in-person' ? 'In-person visit' : 'Video consultation'}
                </p>
              </div>
              
              <div>
                <h3 className="text-gray-500 text-sm">Reason for Visit</h3>
                <p className="font-medium">{appointment.reason || 'Not specified'}</p>
              </div>
            </div>
            
            {appointment.notes && (
              <div className="mt-4">
                <h3 className="text-gray-500 text-sm">Doctor's Notes</h3>
                <div className="bg-gray-50 p-4 rounded-md mt-2">
                  <p>{appointment.notes}</p>
                </div>
              </div>
            )}
            
            {appointment.status === 'cancelled' && (
              <div className="mt-4">
                <h3 className="text-gray-500 text-sm">Cancellation Reason</h3>
                <div className="bg-gray-50 p-4 rounded-md mt-2 text-red-700">
                  <p>{appointment.cancellationReason || 'No reason provided'}</p>
                </div>
              </div>
            )}

            {appointment.attachedRecords && appointment.attachedRecords.length > 0 && (
              <div className="mt-6">
                <h3 className="text-gray-700 font-medium mb-2">Attached Medical Records</h3>
                <div className="space-y-2 mt-2">
                  {appointment.attachedRecords.map(record => (
                    <div key={record._id} className="bg-gray-50 p-3 rounded-md border flex justify-between items-center">
                      <div>
                        <p className="font-medium">{record.title}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(record.date).toLocaleDateString()} | {record.recordType.replace('_', ' ')}
                        </p>
                      </div>
                      <Link 
                        to={`/medical-records/${record._id}`}
                        className="text-primary-600 hover:underline text-sm"
                      >
                        View
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-lg font-bold mb-4">Cancel Appointment</h2>
            <p className="mb-4">Are you sure you want to cancel this appointment?</p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for cancellation (optional)
              </label>
              <textarea
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows="3"
                placeholder="Please provide a reason for cancelling"
              ></textarea>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700"
              >
                Keep Appointment
              </button>
              <button
                onClick={handleCancelAppointment}
                className="px-4 py-2 bg-red-600 text-white rounded-md"
              >
                Cancel Appointment
              </button>
            </div>
          </div>
        </div>
      )}

      {canJoinConsultation && (
        <button
          onClick={handleJoinVideoCall}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
            <path d="M14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
          </svg>
          Join Video Consultation
        </button>
      )}
    </div>
  );
};

export default AppointmentDetails;