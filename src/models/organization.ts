// import * as mongoose from "mongoose";
// import { RootModel, IRootModel } from "./root.model";
// import { OrganizationSchema as Schema } from "../schemas";
// import { IOrganizationSchema } from "../schemas";

// export interface IOrganizationModel extends IRootModel {}

// class OrganizationModel extends RootModel<IOrganizationSchema> implements IOrganizationModel {
//     protected className = "UserModel";
//     protected model: mongoose.Model<mongoose.Document>;

//     constructor(schema: IOrganizationSchema = Schema) {
//         super(schema);
//     }
// }

// export default new OrganizationModel();