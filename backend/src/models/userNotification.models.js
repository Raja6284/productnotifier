import mongoose, { Schema } from 'mongoose';

const userNotificationSchema = new Schema({
    email: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return /\S+@\S+\.\S+/.test(v); // Simple regex for email validation
            },
            message: props => `${props.value} is not a valid email!`
        }
    },
    productUrl: {
        type: String,
        required: true
    },
    notified: {
        type: Boolean,
        default: false // Flag to indicate if the user has been notified
    }
}, {
    timestamps: true
});

// Create a unique index on the combination of email and productUrl
userNotificationSchema.index({ email: 1, productUrl: 1 }, { unique: true });

export const UserNotification = mongoose.model('UserNotification', userNotificationSchema);
