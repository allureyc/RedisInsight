import {MyRedisDatabasePage} from '../../../pageObjects';
import {
    commonUrl
} from '../../../helpers/conf';
import {env, rte} from '../../../helpers/constants';
import {acceptLicenseTerms} from '../../../helpers/database';

const myRedisDatabasePage = new MyRedisDatabasePage();
const standalonePorts = [8100, 8101, 8102, 8103, 12000];
const otherPorts = [28100, 8200];

fixture `Autodiscovery`
    .meta({ type: 'critical_path' })
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptLicenseTerms();
    })
test
    .meta({ env: env.desktop, rte: rte.none })
    .after(async() => {
        // Delete all auto-discovered databases
        for(let i = 0; i < standalonePorts.length; i++) {
            await myRedisDatabasePage.deleteDatabaseByName(`localhost:${standalonePorts[i]}`)
        }
    })
    ('Verify that when users open application for the first time, they can see all auto-discovered Standalone DBs', async t => {
        // Check that standalone DBs have been added into the application
        await t.wait(60000);
        const n = await myRedisDatabasePage.dbNameList.count;
        console.log(`n: ${n}`);
        for(let k = 0; k < n; k++) {
            const name = await myRedisDatabasePage.dbNameList.nth(k).textContent;
            console.log(`AUTODISCOVERY ${k}: ${name}`);
        }
        for(let i = 0; i < standalonePorts.length; i++) {
            await t.expect(myRedisDatabasePage.dbNameList.withExactText(`localhost:${standalonePorts[i]}`).exists).ok('Standalone DBs');
        }
        // Check that Sentinel and OSS cluster have not been added into the application
        for(let j = 0; j < otherPorts.length; j++) {
            await t.expect(myRedisDatabasePage.dbNameList.withExactText(`localhost:${otherPorts[j]}`).exists).notOk('Sentinel and OSS DBs');
        }
    });
