import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Listing } from './listings.entity';
import { User } from '../user/user.entity';

@Injectable()
export class ListingsService {
    constructor(@InjectRepository(Listing) private repo: Repository<Listing>) { }

    findAll() {
        return this.repo.find();
    }

    findOne(id: number) {
        return this.repo.findOne({ where: { id } });
    }

    create(data: Partial<Listing>, owner: User) {
        if (!data) {
            throw new Error('Request body is required');
        }
        
        if (!data.title) {
            throw new Error('Title is required');
        }
        if (!data.description) {
            throw new Error('Description is required');
        }
        if (!data.imageUrl) {
            throw new Error('Image URL is required');
        }
        if (!data.price) {
            throw new Error('Price is required');
        }

        const listing = this.repo.create({ ...data, owner });
        return this.repo.save(listing);
    }

    update(id: number, data: Partial<Listing>) {
        return this.repo.update(id, data);
    }

    remove(id: number) {
        return this.repo.delete(id);
    }
}
