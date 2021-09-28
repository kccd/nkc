module.exports = {
  GET: 'complaintGet',
  POST: 'complaintPost',
  resolve: {
    POST: "complaintResolvePost"
  },
  type: {
    GET: 'complaintPost'
  }
};