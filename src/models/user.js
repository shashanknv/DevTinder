const mongoose = require('mongoose');
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            minLength: 4,
            maxLength: 50,
        },
        lastName: {
            type: String
        },
        emailId: {
            type: String,
            required: true,
            lowercase: true,
            unique: true,
            trim: true,
            validate(value) {
                if(!validator.isEmail(value)) {
                    throw new ErrorEvent("Invalid email address, "+value);
                }
            },
        },
        password: {
            type: String,
            required: true,
            validate(value) {
                if(!validator.isStrongPassword(value)) {
                    throw new ErrorEvent("Enter a strong password, "+value);
                }
            },
        },
        age: {
            type: Number,
            min: 18
        },
        gender: {
            type: String,
            enum: {
                values: ["male", "female", "other"],
                message: `{VALUE} is not a valid gender type`
            },        
            // validate(value) {
            //     if(!["male", "female", "others"].includes(value)) {
            //         throw new Error("gender data is not valid");
            //     }
            // },
        },
        about: {
            type: String,
            default: "Default of user!"
        },
        photoUrl: {
            type: String,
            default: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRcQg-lr5__zRqY3mRg6erzAD9n4BGp3G8VfA&s",
            validate(value) {
                if(!validator.isURL(value)) {
                    throw new ErrorEvent("Invalid photo URL, "+value);
                }
            },
        },
        skills: {
            type: [String],
        }
    },
    {
        timestamps: true,
    }
);

// userSchema.index({ firstName: 1, lastName: 1 });

userSchema.methods.getJWT = async function () {
    const user = this;

    const token = await jwt.sign({_id: user._id}, "DEV@Tinder$790", {
        expiresIn: "7d",
    });

    return token;
};

userSchema.methods.validatePassword = async function (passwordInputByUser) {
    const user = this;
    const passwordHash = user.password;

    const isPasswordValid = await bcrypt.compare(
        passwordInputByUser,
        passwordHash
    );

    return isPasswordValid;
}

module.exports = mongoose.model("User", userSchema);