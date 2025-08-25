import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();


export class ConvenioRepository {
create(data: any) {
return prisma.convenio.create({ data });
}


update(id: string, data: any) {
return prisma.convenio.update({ where: { id_convenio: id }, data });
}


findById(id: string) {
return prisma.convenio.findUnique({ where: { id_convenio: id } });
}


findByEmail(email: string) {
return prisma.convenio.findUnique({ where: { email_contato_convenio: email } });
}


count(where: any) {
return prisma.convenio.count({ where });
}


findMany(where: any, orderBy: any, skip: number, take: number) {
return prisma.convenio.findMany({ where, orderBy, skip, take });
}
}