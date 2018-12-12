import * as mongoose from "mongoose";

interface ISchema {
    schemaInstance(): mongoose.Schema;
    getName(): string;
}

const options = {
    id: true,
    _id: true,
    minimize: false,
    versionKey: false,
    strict: true,
    validateBeforeSave: true,
    timestamps: true,
    toObject: {
        virtuals: true,
        transform: function(_doc, ret){
            delete ret._id;
        }
    },
    toJSON: {
        virtuals: true,
        transform: function(_doc, ret){
            delete ret.__v;
            delete ret._id;
        }
    }
}

function validateMinLength(value: string, len: number): boolean {
    return value.length >= len;
}

function validateMaxLength(value: string, len: number): boolean {
    return value.length <= len;
}


export {
    options,
    validateMinLength,
    validateMaxLength,
    ISchema
}