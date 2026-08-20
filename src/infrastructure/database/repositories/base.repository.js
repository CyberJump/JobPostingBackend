export class BaseRepository {
    constructor(model) {
        if (!model) {
            throw new Error("BaseRepository requires a valid Mongoose model instance");
        }
        this.model = model;
    }

    async findById(id, select = null) {
        let query = this.model.findById(id);
        if (select) query = query.select(select);
        return await query.exec();
    }

    async findOne(filter, select = null) {
        let query = this.model.findOne(filter);
        if (select) query = query.select(select);
        return await query.exec();
    }

    async findMany(filter = {}, options = {}) {
        const { limit = 20, skip = 0, sort = { createdAt: -1 }, select = null } = options;
        let query = this.model.find(filter).sort(sort).skip(skip).limit(limit);
        if (select) query = query.select(select);
        return await query.exec();
    }

    async create(data) {
        return await this.model.create(data);
    }

    async update(id, updateData, options = { new: true }) {
        return await this.model.findByIdAndUpdate(id, updateData, options).exec();
    }

    async delete(id) {
        return await this.model.findByIdAndDelete(id).exec();
    }

    async count(filter = {}) {
        return await this.model.countDocuments(filter).exec();
    }

    async exists(filter) {
        return await this.model.exists(filter);
    }
}

export default BaseRepository;
