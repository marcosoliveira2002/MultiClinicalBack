import { Request, Response } from "express";
import { TipoAtendimentoService } from "../services/tipoAtendimento.service";
import { createTipoAtSchema, updateTipoAtSchema, listTipoAtQuerySchema, idParamSchema } from "../validators/tipoAtendimento.validators";


const service = new TipoAtendimentoService();


export class TipoAtendimentoController {
static async create(req: Request, res: Response) {
try {
const data = createTipoAtSchema.parse(req.body);
const result = await service.create(data);
res.status(201).json(result);
} catch (err: any) { res.status(400).json({ error: err.message }); }
}


static async update(req: Request, res: Response) {
try {
const { id } = idParamSchema.parse(req.params);
const result = await service.update(id, updateTipoAtSchema.parse(req.body));
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
const query = listTipoAtQuerySchema.parse(req.query);
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