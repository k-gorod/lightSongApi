export const permissionToRepository = (role: string = 'guest') => ({
  guest = {},
  member = {},
  admin = {},
  owner = {}
}) => {
  console.log(role)
  return {
    guest,
    member: { ...guest, ...member },
    owner: { ...guest, ...member, ...owner },
    admin: { ...guest, ...member, ...owner, ...admin }
  }[role]
}
