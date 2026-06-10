/**
 * Seed das 6 Áreas de Vida do Mafra.
 * Executa uma vez após deploy da Fase 2.
 *
 * Uso: node backend/scripts/seedAreas.js
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import areaModel from '../models/areaModel.js';
import userModel from '../models/userModel.js';
import goalModel from '../models/goalModel.js';
import projectModel from '../models/projectModel.js';
import taskModel from '../models/taskModel.js';
import habitModel from '../models/habitModel.js';
import notebookModel from '../models/notebookModel.js';

const AREAS = [
    { name: 'Trabalho',           icon: '🏗️', color: '#3b82f6', type: 'trabalho',  order: 0 },
    { name: 'Projetos Externos',  icon: '📐', color: '#f97316', type: 'freelance', order: 1 },
    { name: 'Lab IA & Dev',       icon: '🤖', color: '#22c55e', type: 'dev',       order: 2 },
    { name: 'Finanças',           icon: '💰', color: '#eab308', type: 'financas',  order: 3 },
    { name: 'Sonhos & Vida',      icon: '🌟', color: '#a855f7', type: 'vida',      order: 4 },
    { name: 'Saúde & Hábitos',    icon: '❤️', color: '#ef4444', type: 'saude',     order: 5 },
];

async function run() {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.DB_NAME || 'orkestos' });
    console.log('Conectado ao MongoDB');

    const user = await userModel.findOne({});
    if (!user) {
        console.error('Nenhum usuário encontrado. Faça login primeiro para criar seu usuário.');
        process.exit(1);
    }
    console.log(`Usuário: ${user.email} (${user._id})`);

    // Não duplicar se já existem áreas
    const existing = await areaModel.countDocuments({ userId: user._id });
    if (existing > 0) {
        console.log(`Já existem ${existing} área(s) para este usuário. Pulando seed.`);
        process.exit(0);
    }

    // Criar as 6 áreas
    const created = await areaModel.insertMany(AREAS.map(a => ({ ...a, userId: user._id })));
    console.log(`${created.length} áreas criadas.`);

    // Pegar a área "Trabalho" como default para dados existentes
    const defaultArea = created.find(a => a.type === 'trabalho');

    // Migrar documentos existentes que não têm areaId
    const filter = { userId: user._id, areaId: null };
    const update = { $set: { areaId: defaultArea._id } };

    const [gr, pr, tr, hr, nr] = await Promise.all([
        goalModel.updateMany(filter, update),
        projectModel.updateMany(filter, update),
        taskModel.updateMany(filter, update),
        habitModel.updateMany(filter, update),
        notebookModel.updateMany(filter, update),
    ]);

    console.log(`Migração: goals=${gr.modifiedCount} projetos=${pr.modifiedCount} tarefas=${tr.modifiedCount} hábitos=${hr.modifiedCount} notebooks=${nr.modifiedCount}`);
    console.log('Seed concluído com sucesso!');
    process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
