import React, { useState } from 'react';
import { StorageManager } from '.src/data/storage_manager';

const ProjectManager: React.FC = () => {
  const [projectName, setProjectName] = useState('');
  const [projects, setProjects] = useState<string[]>([]);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false);

  const handleCreateProject = () => {
    if (projectName.trim() !== '') {
      setProjects([...projects, projectName]);
      setProjectName('');
    }
  };

  const handleLoadProject = (project: string) => {
    // プロジェクト読み込み処理
    console.log(`Loading project: ${project}`);
  };

  const handleSaveProject = (project: string) => {
    // プロジェクト保存処理
    console.log(`Saving project: ${project}`);
  };

  const handleDeleteProject = (project: string) => {
    setProjects(projects.filter((p) => p !== project));
  };

  const handleToggleAutoSave = () => {
    setAutoSaveEnabled(!autoSaveEnabled);
  };

  return (
    <div className="bg-white dark:bg-gray-800 min-h-screen flex justify-center items-center">
      <Card className="w-full max-w-2xl bg-card">
        <CardHeader className="bg-card">
          <CardTitle className="text-2xl font-bold bg-card">プロジェクト管理</CardTitle>
          <CardDescription className="bg-card">プロジェクトの保存、読み込み、管理を行います。</CardDescription>
        </CardHeader>
        <CardContent className="bg-card">
          <div className="mb-4">
            <Label htmlFor="projectName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              プロジェクト名
            </Label>
            <Input
              type="text"
              id="projectName"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
          </div>
          <Button onClick={handleCreateProject} className="bg-blue-500 text-white font-bold py-2 px-4 rounded">
            プロジェクト作成
          </Button>

          <Separator className="my-4 bg-gray-300 dark:bg-gray-700" />

          <div className="mb-4">
            <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">プロジェクト一覧</h3>
            {projects.length > 0 ? (
              <ul className="list-disc pl-5">
                {projects.map((project) => (
                  <li key={project} className="text-gray-700 dark:text-gray-300">
                    {project}
                    <div className="inline-flex space-x-2 ml-2">
                      <Button onClick={() => handleLoadProject(project)} variant="outline" size="sm">
                        読み込み
                      </Button>
                      <Button onClick={() => handleSaveProject(project)} variant="outline" size="sm">
                        保存
                      </Button>
                      <Button onClick={() => handleDeleteProject(project)} variant="destructive" size="sm">
                        削除
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">プロジェクトはまだありません。</p>
            )}
          </div>

          <Separator className="my-4 bg-gray-300 dark:bg-gray-700" />

          <div className="flex items-center space-x-2">
            <Label htmlFor="autoSave" className="text-gray-700 dark:text-gray-300">
              自動保存
            </Label>
            <Input
              type="checkbox"
              id="autoSave"
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-offset-gray-800"
              checked={autoSaveEnabled}
              onChange={handleToggleAutoSave}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
export default ProjectManager;
