export type VolunteerApplicationInput = {
  userId: mongoose.Types.ObjectId;
  PhotoUrl: string;
  stateOfResidence: string;
  homeAddress: string;
  maritalStatus: "single" | "married" | "divorced" | "widowed";
  nextOfKin: {
    name: string;
    relationship: "parent" | "sibling" | "spouse" | "friend" | "other";
    state: string;
    address: string;
    phone: string;
  };
};

import mongoose, { Schema, Document, Model } from "mongoose";

export interface INextOfKin {
  name: string;
  relationship: string;
  state: string;
  address: string;
  phone: string;
}
export interface IVolunteer extends Document {
  userId: mongoose.Types.ObjectId;
  PhotoUrl?: string;
  stateOfResidence: string;
  homeAddress: string;
  maritalStatus: "single" | "married" | "divorced" | "widowed";

  nextOfKin: {
    name: string;
    relationship: "parent" | "sibling" | "spouse" | "friend" | "other";
    state: string;
    address: string;
    phone: string;
  };

  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

const VolunteerSchema: Schema<IVolunteer> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    PhotoUrl: {
      type: String,
      required: true,
    },

    stateOfResidence: {
      type: String,
      required: true,
    },

    homeAddress: {
      type: String,
      required: true,
    },

    maritalStatus: {
      type: String,
      enum: ["single", "married", "divorced", "widowed"],
      required: true,
    },

    nextOfKin: {
      name: {
        type: String,
        required: true,
      },
      relationship: {
        type: String,
        enum: ["parent", "sibling", "spouse", "friend", "other"],
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);


const VolunteerModel: Model<IVolunteer> =
  mongoose.models.Volunteer || mongoose.model<IVolunteer>("Volunteer", VolunteerSchema);

export default VolunteerModel;
