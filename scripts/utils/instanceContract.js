const { methods } = require(".");

async function instanceContract(path, address, privateKey) {
    var data = require(path);
    var provider = ethers.providers.getDefaultProvider(await methods.getProvider());
    let user = new ethers.Wallet(privateKey, provider);

    return (await new ethers.Contract(address,data.abi,user));
}

module.exports = {instanceContract}