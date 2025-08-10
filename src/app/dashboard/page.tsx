'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Patient {
  id: number;
  name: string;
  status: string;
}

interface Doctor {
  id: number;
  name: string;
  specialization: string;
  availability: string;
}

interface Appointment {
    id: number;
    time: string;
    status: string;
    patient: Patient;
    doctor: Doctor;
}

export default function DashboardPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPatientName, setNewPatientName] = useState('');
  const [newDoctor, setNewDoctor] = useState({
      name: '',
      specialization: '',
      availability: 'Available'
  });
  const [newAppointment, setNewAppointment] = useState({
    patientId: '',
    doctorId: '',
    time: ''
  });
  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Waiting': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'With Doctor': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'Available': return 'bg-green-100 text-green-800 border-green-200';
      case 'Busy': return 'bg-red-100 text-red-800 border-red-200';
      case 'Off Duty': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Booked': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Canceled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const fetchData = async (token: string) => {
    try {
      const patientsRes = await fetch('https://young-inlet-39708.herokuapp.com/patients', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const patientsData = await patientsRes.json();
      setPatients(patientsData);

      const doctorsRes = await fetch('https://young-inlet-39708.herokuapp.com/doctors', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const doctorsData = await doctorsRes.json();
      setDoctors(doctorsData);

      const appointmentsRes = await fetch('https://young-inlet-39708.herokuapp.com/appointments', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const appointmentsData = await appointmentsRes.json();
      setAppointments(appointmentsData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/');
    } else {
      fetchData(token);
    }
  }, [router]);

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('accessToken');
    if (!newPatientName || !token) return;
    
    try {
      await fetch('https://young-inlet-39708.herokuapp.com/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newPatientName }),
      });
      setNewPatientName('');
      fetchData(token);
    } catch (error) {
      console.error("Failed to add patient:", error);
    }
  };

  const handleAddDoctor = async (e: React.FormEvent) => {
      e.preventDefault();
      const token = localStorage.getItem('accessToken');
      if (!newDoctor.name || !newDoctor.specialization || !token) return;
      try {
          await fetch('https://young-inlet-39708.herokuapp.com/doctors', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(newDoctor),
          });
          setNewDoctor({ name: '', specialization: '', availability: 'Available' });
          fetchData(token);
      } catch (error) {
          console.error("Failed to add doctor:", error);
      }
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('accessToken');
    if (!newAppointment.patientId || !newAppointment.doctorId || !newAppointment.time || !token) return;

    try {
        await fetch('https://young-inlet-39708.herokuapp.com/appointments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                patient: { id: parseInt(newAppointment.patientId) },
                doctor: { id: parseInt(newAppointment.doctorId) },
                time: newAppointment.time
            }),
        });
        setNewAppointment({ patientId: '', doctorId: '', time: '' });
        fetchData(token);
    } catch (error) {
        console.error("Failed to book appointment:", error);
    }
  };

  const handleUpdatePatientStatus = async (id: number, status: string) => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      await fetch(`https://young-inlet-39708.herokuapp.com/patients/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      fetchData(token);
    } catch (error) {
      console.error("Failed to update patient status:", error);
    }
  };

  const handleUpdateAppointmentStatus = async (id: number, status: string) => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      await fetch(`https://young-inlet-39708.herokuapp.com/appointments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      fetchData(token);
    } catch (error) {
      console.error("Failed to update appointment status:", error);
    }
  };

  const handleDeletePatient = async (id: number) => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    
    try {
      await fetch(`https://young-inlet-39708.herokuapp.com/patients/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchData(token);
    } catch (error) {
      console.error("Failed to delete patient:", error);
    }
  };

  const handleDeleteDoctor = async (id: number) => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    
    try {
      await fetch(`https://young-inlet-39708.herokuapp.com/doctors/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchData(token);
    } catch (error) {
      console.error("Failed to delete doctor:", error);
    }
  };

  const handleDeleteAppointment = async (id: number) => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    
    try {
      await fetch(`https://young-inlet-39708.herokuapp.com/appointments/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData(token);
    } catch (error) {
      console.error("Failed to delete appointment:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-white">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-gray-900">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 -right-4 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      <header className="relative backdrop-blur-xl bg-white/10 border-b border-white/20 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                Allo Health
              </h1>
            </div>
            <button 
              onClick={handleLogout} 
              className="group px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <span className="flex items-center space-x-2">
                <svg className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                </svg>
                <span>Logout</span>
              </span>
            </button>
          </div>
        </div>
      </header>

      <main className="relative container mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Queue Management Card */}
          <div className="group backdrop-blur-xl bg-white/10 rounded-3xl p-8 border border-white/20 shadow-2xl hover:bg-white/15 transition-all duration-500 hover:scale-[1.02]">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white">Queue Management</h2>
            </div>
            
            <form onSubmit={handleAddPatient} className="flex gap-3 mb-6">
              <input
                type="text"
                placeholder="Enter patient name"
                value={newPatientName}
                onChange={(e) => setNewPatientName(e.target.value)}
                className="flex-grow px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 hover:bg-white/25"
              />
              <button type="submit" className="px-6 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-xl hover:from-cyan-500 hover:to-blue-600 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                Add
              </button>
            </form>
            
            <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20">
              {patients.map((patient, index) => (
                <div key={patient.id} className="backdrop-blur-sm bg-white/10 p-5 rounded-2xl border border-white/20 shadow-lg hover:bg-white/15 transition-all duration-300 transform hover:scale-[1.02]">
                  <div className="flex justify-between items-center">
                    <div className="flex-grow">
                      <p className="text-white font-semibold text-lg">{patient.name}</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(patient.status)} mt-2`}>
                        {patient.status}
                      </span>
                    </div>
                    <div className="flex gap-3 ml-4">
                      <select 
                        value={patient.status} 
                        onChange={(e) => handleUpdatePatientStatus(patient.id, e.target.value)}
                        className="px-3 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-300"
                      >
                        <option value="Waiting" className="text-gray-900">Waiting</option>
                        <option value="With Doctor" className="text-gray-900">With Doctor</option>
                        <option value="Completed" className="text-gray-900">Completed</option>
                      </select>
                      <button 
                        onClick={() => handleDeletePatient(patient.id)}
                        className="w-10 h-10 bg-gradient-to-r from-red-400 to-pink-500 text-white rounded-xl hover:from-red-500 hover:to-pink-600 shadow-lg transform hover:scale-110 transition-all duration-300 flex items-center justify-center"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Appointment Management Card */}
          <div className="group backdrop-blur-xl bg-white/10 rounded-3xl p-8 border border-white/20 shadow-2xl hover:bg-white/15 transition-all duration-500 hover:scale-[1.02]">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white">Appointments</h2>
            </div>
            
            <form onSubmit={handleBookAppointment} className="space-y-4 mb-6">
              <select 
                value={newAppointment.patientId} 
                onChange={(e) => setNewAppointment({ ...newAppointment, patientId: e.target.value })}
                className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all duration-300"
              >
                <option value="" className="text-gray-900">Select Patient</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id} className="text-gray-900">{patient.name}</option>
                ))}
              </select>
              <select
                value={newAppointment.doctorId}
                onChange={(e) => setNewAppointment({ ...newAppointment, doctorId: e.target.value })}
                className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all duration-300"
              >
                <option value="" className="text-gray-900">Select Doctor</option>
                {doctors.map(doctor => (
                  <option key={doctor.id} value={doctor.id} className="text-gray-900">{doctor.name}</option>
                ))}
              </select>
              <input
                type="datetime-local"
                value={newAppointment.time}
                onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
                className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all duration-300"
              />
              <button type="submit" className="w-full px-4 py-3 bg-gradient-to-r from-purple-400 to-pink-500 text-white rounded-xl hover:from-purple-500 hover:to-pink-600 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold">
                Book Appointment
              </button>
            </form>
            
            <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20">
              {appointments.map(appointment => (
                <div key={appointment.id} className="backdrop-blur-sm bg-white/10 p-5 rounded-2xl border border-white/20 shadow-lg hover:bg-white/15 transition-all duration-300">
                  <div className="flex justify-between items-start">
                    <div className="flex-grow">
                      <p className="text-white font-semibold">
                        {appointment.patient?.name} → {appointment.doctor?.name}
                      </p>
                      <p className="text-white/70 text-sm mt-1">
                        📅 {new Date(appointment.time).toLocaleString()}
                      </p>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(appointment.status)} mt-2`}>
                        {appointment.status}
                      </span>
                    </div>
                    <div className="flex gap-3 ml-4">
                      <select 
                        value={appointment.status} 
                        onChange={(e) => handleUpdateAppointmentStatus(appointment.id, e.target.value)}
                        className="px-3 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all duration-300"
                      >
                        <option value="Booked" className="text-gray-900">Booked</option>
                        <option value="Completed" className="text-gray-900">Completed</option>
                        <option value="Canceled" className="text-gray-900">Canceled</option>
                      </select>
                      <button 
                        onClick={() => handleDeleteAppointment(appointment.id)}
                        className="w-10 h-10 bg-gradient-to-r from-red-400 to-pink-500 text-white rounded-xl hover:from-red-500 hover:to-pink-600 shadow-lg transform hover:scale-110 transition-all duration-300 flex items-center justify-center"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Doctors Management Card */}
          <div className="group backdrop-blur-xl bg-white/10 rounded-3xl p-8 border border-white/20 shadow-2xl hover:bg-white/15 transition-all duration-500 hover:scale-[1.02]">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white">Doctors</h2>
            </div>
            
            <form onSubmit={handleAddDoctor} className="space-y-4 mb-6">
                <input
                    type="text"
                    placeholder="Doctor Name"
                    value={newDoctor.name}
                    onChange={(e) => setNewDoctor({...newDoctor, name: e.target.value})}
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all duration-300"
                />
                <input
                    type="text"
                    placeholder="Specialization"
                    value={newDoctor.specialization}
                    onChange={(e) => setNewDoctor({...newDoctor, specialization: e.target.value})}
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all duration-300"
                />
                <select
                    value={newDoctor.availability}
                    onChange={(e) => setNewDoctor({...newDoctor, availability: e.target.value})}
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all duration-300"
                >
                    <option value="Available" className="text-gray-900">Available</option>
                    <option value="Busy" className="text-gray-900">Busy</option>
                    <option value="Off Duty" className="text-gray-900">Off Duty</option>
                </select>
                <button type="submit" className="w-full px-4 py-3 bg-gradient-to-r from-emerald-400 to-teal-500 text-white rounded-xl hover:from-emerald-500 hover:to-teal-600 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold">
                    Add Doctor
                </button>
            </form>
            
            <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20">
              {doctors.map(doctor => (
                <div key={doctor.id} className="backdrop-blur-sm bg-white/10 p-5 rounded-2xl border border-white/20 shadow-lg hover:bg-white/15 transition-all duration-300">
                  <div className="flex justify-between items-center">
                    <div className="flex-grow">
                      <p className="text-white font-semibold text-lg">{doctor.name}</p>
                      <p className="text-white/70 text-sm">{doctor.specialization}</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(doctor.availability)} mt-2`}>
                        {doctor.availability}
                      </span>
                    </div>
                    <button 
                      onClick={() => handleDeleteDoctor(doctor.id)}
                      className="w-10 h-10 bg-gradient-to-r from-red-400 to-pink-500 text-white rounded-xl hover:from-red-500 hover:to-pink-600 shadow-lg transform hover:scale-110 transition-all duration-300 flex items-center justify-center ml-4"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
