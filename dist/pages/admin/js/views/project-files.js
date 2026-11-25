import {renderProjectFiles} from '../../../portal/project-files.js';
import {API_URL} from '../core/config.js';
import {getAuthHeaders} from '../core/api.js';
export function renderAdminProjectFiles(root,project,current){return renderProjectFiles(root,project,current,{base:API_URL+'/api/admin/project-files',headers:getAuthHeaders});}
