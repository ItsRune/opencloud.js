const PaginateCursor = require('../Modules/paginateCursor');
const createQuery = require('../Modules/createQuery');
const urls = require('../Utils/uris.json');

class GroupService {
    /**
     * Constructs the GroupService class.
     * @param {Universe} universe 
     */
    constructor(universe) {
        throw new Error("This class is not meant to be used.");
        if (!universe.isUniverse && !universe.isUniverse()) throw new Error("universe must be provided");

        this._universe = universe;
    };

    /**
     * Gets a group's information.
     * @param {Number} groupId 
     * @returns {Promise} GroupInfo
     */
    async GetGroupInfo(groupId) {
        const query = createQuery(`${urls.OPENCLOUD_GROUPS}/v1/groups/${groupId}`);

        try {
            return await this._universe._fetch(query, 'GET');
        } catch(error) {
            throw { success: false, error: error.message };
        }
    };

    /**
     * Private method for getting user with a role.
     * @param {Number} groupId 
     * @param {Number} roleId 
     * @returns {Pagination} Users
     */
    async #_getUsersWithRoleId(groupId, roleId) {
        const query = createQuery(`${urls.OPENCLOUD_GROUPS}/v1/groups/${groupId}/roles/${roleId}/users`);
        
        try {
            return new PaginateCursor(query, "GET", { 'Content-Type': 'application/json' }, null, "data");
        } catch(error) {
            throw { success: false, error: error.message };
        }
    };

    /**
     * Private method for getting a role's ID.
     * @param {Number} groupId 
     * @param {String} roleName 
     * @returns {Number} roleId
     */
    async #_getRoleIdFromName(groupId, roleName) {
        try {
            const roles = await this.GetRoles(groupId);
            const role = roles.find(r => r.name === roleName);
            if (!role) throw new Error("role not found");
            
            return role.id;
        } catch(err) {
            throw err;
        }
    };

    /**
     * Gets all the users with a specific role.
     * @param {Number} groupId 
     * @param {Number | String} role 
     * @returns {Pagination} Users
     */
    async GetUsersWithRole(groupId, role) {
        if (!groupId) throw new Error("groupId must be provided");
        if (!role) throw new Error("role must be provided");
        let roleId = role;

        if (!Number(role)) {
            try {
                roleId = await this.#_getRoleIdFromName(groupId, role);
            }
            catch(err) {
                throw err;
            }
        }

        try {
            return await this.#_getUsersWithRoleId(groupId, roleId);
        }
        catch(err) {
            throw err;
        }
    };

    /**
     * Gets all the roles within a group.
     * @param {Number} groupId
     * @returns {Promise} Roles 
     */
    async GetRoles(groupId) {
        if (!Number(groupId)) throw new Error("groupId must be provided");
        const query = createQuery(`${urls.OPENCLOUD_GROUPS}/v1/groups/${groupId}/roles`);

        try {
            return await this._universe._fetch(query, 'GET');
        } catch(error) {
            throw { success: false, error: error.message };
        }
    }

    /**
     * Gets the user's groups.
     * @param {Number} userId 
     * @param {Number} groupId 
     * @returns {Promise} Groups
     */
    async GetUsersGroups(userId, groupId) {
        if (!userId) throw new Error("userId must be provided");
        if (!groupId) throw new Error("groupId must be provided");
        const query = createQuery(`${urls.OPENCLOUD_GROUPS}/v1/users/${userId}/groups/${groupId}`);

        try {
            return await this._universe._fetch(query, 'GET');
        }
        catch(err) {
            throw { success: false, error: err.message };
        }
    };
}

module.exports = GroupService;