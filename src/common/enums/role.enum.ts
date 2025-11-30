/**
 * User Role Hierarchy
 * Member < Elder < CoLeader < Leader < SuperAdmin
 */
export enum Role {
  MEMBER = 'MEMBER',
  ELDER = 'ELDER',
  CO_LEADER = 'CO_LEADER',
  LEADER = 'LEADER',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

/**
 * Role hierarchy weight for comparison
 */
export const RoleWeight = {
  [Role.MEMBER]: 1,
  [Role.ELDER]: 2,
  [Role.CO_LEADER]: 3,
  [Role.LEADER]: 4,
  [Role.SUPER_ADMIN]: 5,
};