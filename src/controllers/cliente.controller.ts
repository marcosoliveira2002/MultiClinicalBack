import { Request, Response } from "express";
import { ClienteService } from "../services/cliente.service";
import { createClienteSchema, updateClienteSchema, listClienteQuerySchema, idParamSchema } from "../validators/cliente.validators";


const service = new ClienteService();


export class ClienteController {
static async create(req: Request, res: Response) {
try {
const data = createClienteSchema.parse(req.body);
const result = await service.create(data);
res.status(201).json(result);
} catch (err: any) { res.status(400).json({ error: err.message }); }
}


static async update(req: Request, res: Response) {
try {
const { id } = idParamSchema.parse(req.params);
const result = await service.update(id, updateClienteSchema.parse(req.body));
res.json(result);
} catch (err: any) { res.status(400).json({ error: err.message }); }
}


static async getById(req: Request, res: Response) {
try {
const { id } = idParamSchema.parse(req.params);
const result = await service.getById(id);
res.json(result);
} catch (err: any) { res.status(404).json({ error: err.message }); }
}


static async list(req: Request, res: Response) {
try {
const query = listClienteQuerySchema.parse(req.query);
const result = await service.list(query);
res.json(result);
} catch (err: any) { res.status(400).json({ error: err.message }); }
}


static async inativar(req: Request, res: Response) {
try {
const { id } = idParamSchema.parse(req.params);
const result = await service.inativar(id);
res.json(result);
} catch (err: any) { res.status(400).json({ error: err.message }); }
}


static async ativar(req: Request, res: Response) {
try {
const { id } = idParamSchema.parse(req.params);
const result = await service.ativar(id);
res.json(result);
} catch (err: any) { res.status(400).json({ error: err.message }); }
}
}