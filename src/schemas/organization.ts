// import * as mongoose from "mongoose";
// import * as paginate from "mongoose-paginate";
// import * as uniqueValidator from "mongoose-unique-validator";
// import * as _ from "lodash";
// import * as Boom from "boom";

// import { options, ISchema } from "./root.schema";
// import { Error as errCode } from "../constants";

// const Schema = mongoose.Schema;

// /* Interface */
// export interface IOrganizationSchema extends ISchema {}

// class OrganizationSchema implements IOrganizationSchema {

//     private schemaDef: mongoose.SchemaDefinition;
//     private schemaName: string;

//     constructor() {

//         this.schemaName = "Organization";
//         this.schemaDef = {
//             name: {
//                 type: String,
//                 required: [true, errCode.EM0115],
//                 unique: true,
//                 dropDups: true
//             },
//             isActive: {
//                 type: String,
//                 required: false,
//                 enum: ["0", "1"],
//                 trim: true,
//                 default: "1"
//             },
//             isRemove: {
//                 type: String,
//                 default: false
//             }
//         }

//     }

//     public schemaInstance = () => {
//         const self = this;
//         let schema = new Schema(
//             this.schemaDef,
//             {
//                 ...options,
//                 collection: self.schemaName
//             }
//         );
//         schema.plugin(paginate).plugin(uniqueValidator);

//         schema.post("save", function(error: any, _doc, next){
//             if(error.name === "ValidationError"){
//                 if(error.errors.role){
//                     next(Boom.badData("Role was outside scope"));
//                 }
//                 if(error.errors.password){
//                     next(Boom.badData(error.errors.password.message));
//                 }
//                 if(error.errors.username){
//                     const { kind } = error.errors.username;

//                     switch (kind) {
//                         case "unique":
//                             next(Boom.conflict(errCode.EM0116));
//                             break;
//                         default:
//                             next(Boom.badData(error.errors.username.message));
//                             break;
//                     }
//                 }
//                 next();
//             }
//             else{
//                 next(error);
//             }
//         });

//         schema.post("find", function(error: any, _doc: any, next){
//             if(error.kind === "ObjectId"){
//                 next(new Error("Name is not found"));
//             }
//             next();
//         });

//         schema.post("findOneAndUpdate", function(error: any, _doc, next){
//             if(error.code === 11000){
//                 return next(Boom.conflict("Name is exist"));
//             }
//             next();
//         });

//         return schema;

//     }

//     /* Get Name Model */
//     public getName = () => {
//         return this.schemaName;
//     }

// }

// export default new OrganizationSchema();