import { Request, Response } from "express";
import { ConvenioService } from "../services/convenio.service";
import { createConvenioSchema, updateConvenioSchema, listConvenioQuerySchema } from "../validators/convenio.validators";


const service = new ConvenioService();


export class ConvenioController {
static async create(req: Request, res: Response) {
try {
const data = createConvenioSchema.parse(req.body);
const result = await service.create(data);
res.status(201).json(result);
} catch (err: any) {
res.status(400).json({ error: err.message });
}
}


static async update(req: Request, res: Response) {
try {
const result = await service.update(req.params.id, updateConvenioSchema.parse(req.body));
res.json(result);
} catch (err: any) {
res.status(400).json({ error: err.message });
}
}


static async getById(req: Request, res: Response) {
try {
const result = await service.getById(req.params.id);
res.json(result);
} catch (err: any) {
res.status(404).json({ error: err.message });
}
}


static async list(req: Request, res: Response) {
try {
const result = await service.list(listConvenioQuerySchema.parse(req.query));
res.json(result);
} catch (err: any) {
res.status(400).json({ error: err.message });
}
}


static async inativar(req: Request, res: Response) {
try {
const result = await service.inativar(req.params.id);
res.json(result);
} catch (err: any) {
res.status(400).json({ error: err.message });
}
}


static async ativar(req: Request, res: Response) {
try {
const result = await service.ativar(req.params.id);
res.json(result);
} catch (err: any) {
res.status(400).json({ error: err.message });
}
}
}