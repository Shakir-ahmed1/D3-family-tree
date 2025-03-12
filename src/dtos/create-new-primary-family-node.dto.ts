import { Gender } from "./gender.enum";

export interface CreateNewPrimaryFamilyNodeInterface {
    name: string;

    gender: Gender;

    title: string;

    phone: string;

    address: string;

    nickName: string;

    birthDate: Date;

    deathDate: Date;

    ownedById: number;
}
