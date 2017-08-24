const concatenate = jest.genMockFromModule('concatenate');

concatenate.sync = () => '';

module.exports = concatenate;
