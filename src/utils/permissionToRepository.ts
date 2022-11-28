export const permissionToRepository = (role: string = 'guest') => ({
  guest = {},
  member = {},
  admin = {},
  owner = {}
}) => {
  return {
    guest,
    member: { ...guest, ...member },
    owner: { ...guest, ...member, ...owner },
    admin: { ...guest, ...member, ...owner, ...admin }
  }[role]
}
