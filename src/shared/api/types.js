// Статусы
export const PRIORITY = {
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
};

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 * @property {string} name
 * @property {string|null} avatar_url
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} AuthRegisterPayload
 * @property {string} email
 * @property {string} password
 * @property {string} name
 */

/**
 * @typedef {Object} AuthLoginPayload
 * @property {string} email
 * @property {string} password
 */

/**
 * @typedef {Object} AuthLoginResponse
 * @property {string} access_token
 * @property {number} expires_in
 */

/**
 * @typedef {Object} Status
 * @property {string} id
 * @property {string} name
 * @property {number} position
 * @property {boolean} is_closed
 */

/**
 * @typedef {Object} StatusCreatePayload
 * @property {string} name
 * @property {number} position
 * @property {boolean} is_closed
 */

/**
 * @typedef {Partial<StatusCreatePayload>} StatusUpdatePayload
 */

/**
 * @typedef {Object} Task
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string} status_id
 * @property {keyof typeof PRIORITY} priority
 * @property {string|null} reporter_id
 * @property {string|null} assignee_id
 * @property {string|null} due_date
 * @property {string[]} [tag_ids]
 * @property {string} [created_at]
 */

/**
 * @typedef {Object} TaskCreatePayload
 * @property {string} title
 * @property {string} description
 * @property {string} status_id
 * @property {keyof typeof PRIORITY} priority
 * @property {string} reporter_id
 * @property {string|null} assignee_id
 * @property {string|null} due_date
 * @property {string[]} [tag_ids]
 */

/**
 * @typedef {Partial<TaskCreatePayload>} TaskUpdatePayload
 */

/**
 * @typedef {Object} PaginatedTasks
 * @property {Task[]} items
 * @property {number} total
 * @property {number} limit
 * @property {number} offset
 */

/**
 * @typedef {Object} Project
 * @property {string} id
 * @property {string} key
 * @property {string} name
 * @property {string} description
 * @property {string} lead_id
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} ProjectCreatePayload
 * @property {string} key
 * @property {string} name
 * @property {string} description
 * @property {string} lead_id
 */

/**
 * @typedef {Partial<ProjectCreatePayload>} ProjectUpdatePayload
 */

/**
 * @typedef {Object} PaginatedProjects
 * @property {Project[]} items
 * @property {number} total
 * @property {number} limit
 * @property {number} offset
 */

/**
 * @typedef {Object} ProjectMember
 * @property {string} user_id
 * @property {'OWNER'|'MEMBER'} role
 * @property {string} added_at
 */



