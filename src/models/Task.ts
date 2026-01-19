import mongoose, {Document, model, Schema, Types} from "mongoose";


export interface ITask extends Document {
    taskName : string,
    description : string,
    project : Types.ObjectId,
    status : TaskStatus
};

const taskStatus = {
    PENDING : 'pending',
    ON_HOLD : 'onHold',
    IN_PROGRESS : 'inProgress',
    UNDER_REVIEW : 'underReview',
    COMPLETED : 'completed'
} as const


export type TaskStatus = typeof taskStatus[keyof typeof taskStatus]


export const TaskSchema : Schema = new Schema({
    taskName : {
        type : String,
        required : true
    },
    description : {
        type : String,
        required : true
    },
    project : {
        type : Types.ObjectId,
        ref : 'Project'
    },
    status : {
        type : String,
        enum : Object.values(taskStatus),
        default : taskStatus.PENDING
    }
},{timestamps:true});


const Task = mongoose.model<ITask>('Task', TaskSchema);

export default Task;