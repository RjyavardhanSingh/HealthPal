const mongoose = require('mongoose');
const Person = require('./Person');

const doctorSchema = new mongoose.Schema({
  specialization: {
    type: String,
    required: true
  },
  qualifications: [{
    degree: String,
    institution: String,
    year: Number
  }],
  licenseNumber: {
    type: String,
    required: true
  },
  experience: {
    type: Number,  // in years
    default: 0
  },
  consultationFee: {
    type: Number,
    required: true
  },
  availability: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    slots: [{
      startTime: String,  // format: "HH:MM" in 24hr
      endTime: String,
      isBooked: {
        type: Boolean,
        default: false
      }
    }]
  }],
  hospital: {
    name: String,
    address: String
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  reviews: [{
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  workingHours: {
    start: {
      type: String,
      default: '09:00'
    },
    end: {
      type: String,
      default: '17:00'
    }
  },
  isAcceptingAppointments: {
    type: Boolean,
    default: true
  }
});

const Doctor = Person.discriminator('Doctor', doctorSchema);

module.exports = Doctor;