import projectModel from '../models/projectModel.js';
import taskModel from '../models/taskModel.js';
import asyncHandler from '../utils/asyncHandler.js';

// Criar projeto
const createProject = asyncHandler(async (req, res) => {
    const {
        title, goalId, deadline, description, areaId,
        workflowType, currentPhase, disciplines,
        stack, repoUrl, deployUrl, publishToPortfolio,
        clientId, contractValue,
    } = req.body;
    const userId = req.user.id;

    if (!title) {
        return res.json({ success: false, message: 'Title is required' });
    }

    const newProject = new projectModel({
        userId,
        title,
        goalId: goalId || null,
        deadline: deadline || null,
        description: description || '',
        areaId: areaId || null,
        workflowType: workflowType || 'generico',
        currentPhase: currentPhase || '',
        disciplines: disciplines || [],
        stack: stack || [],
        repoUrl: repoUrl || '',
        deployUrl: deployUrl || '',
        publishToPortfolio: publishToPortfolio || false,
        clientId: clientId || null,
        contractValue: contractValue || null,
    });

    await newProject.save();
    res.json({ success: true, project: newProject, message: 'Project Created Successfully' });
});

// Get All Projects
const getProjects = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const projects = await projectModel.find({ userId });

    // Calculate progress dynamically for each project
    const projectsWithProgress = await Promise.all(projects.map(async (project) => {
        const projectTasks = await taskModel.find({ userId, projectId: project._id });
        const completedTasks = projectTasks.filter(task => task.completed).length;
        const progress = projectTasks.length > 0 ? Math.round((completedTasks / projectTasks.length) * 100) : 0;

        return {
            ...project.toObject(),
            progress,
            tasksConcluido: completedTasks,
            totalTasks: projectTasks.length
        };
    }));

    res.json({ success: true, projects: projectsWithProgress });
});

// Update Project
const updateProject = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    if (!req.body.projectId) {
        return res.json({ success: false, message: 'Project ID is required' });
    }

    const project = await projectModel.findOne({ _id: req.body.projectId, userId });
    if (!project) {
        return res.json({ success: false, message: 'Project not found' });
    }

    const {
        title, goalId, deadline, description, areaId,
        workflowType, currentPhase, disciplines,
        stack, repoUrl, deployUrl, publishToPortfolio,
        clientId, contractValue, contractInstallments,
    } = req.body;

    if (title) project.title = title;
    if (goalId !== undefined) project.goalId = goalId;
    if (deadline !== undefined) project.deadline = deadline;
    if (description !== undefined) project.description = description;
    if (areaId !== undefined) project.areaId = areaId;
    if (workflowType !== undefined) project.workflowType = workflowType;
    if (currentPhase !== undefined) project.currentPhase = currentPhase;
    if (disciplines !== undefined) project.disciplines = disciplines;
    if (stack !== undefined) project.stack = stack;
    if (repoUrl !== undefined) project.repoUrl = repoUrl;
    if (deployUrl !== undefined) project.deployUrl = deployUrl;
    if (publishToPortfolio !== undefined) project.publishToPortfolio = publishToPortfolio;
    if (clientId !== undefined) project.clientId = clientId;
    if (contractValue !== undefined) project.contractValue = contractValue;
    if (contractInstallments !== undefined) project.contractInstallments = contractInstallments;

    await project.save();
    res.json({ success: true, project, message: 'Project Updated Successfully' });
});

// Delete Project
const deleteProject = asyncHandler(async (req, res) => {
    const { projectId } = req.body;
    const userId = req.user.id;

    if (!projectId) {
        return res.json({ success: false, message: 'Project ID is required' });
    }

    const project = await projectModel.findOneAndDelete({ _id: projectId, userId });
    if (!project) {
        return res.json({ success: false, message: 'Project not found' });
    }

    res.json({ success: true, message: 'Projeto excluido com sucesso' });
});

export { createProject, getProjects, updateProject, deleteProject };
