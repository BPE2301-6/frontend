// Статусы
export const PRIORITY = {
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
};

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


