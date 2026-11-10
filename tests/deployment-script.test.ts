import { execFileSync } from 'node:child_process'
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'

const directories: string[] = []
const bash = process.platform === 'win32' && existsSync('C:/Program Files/Git/bin/bash.exe')
  ? 'C:/Program Files/Git/bin/bash.exe'
  : 'bash'
const shellPath = (path: string) => path.replaceAll('\\', '/')

afterEach(() => {
  for (const directory of directories.splice(0)) {
    rmSync(directory, { recursive: true, force: true })
  }
})

describe('repository deployment', () => {
  it('downloads private templates through gh and preserves existing credentials on rerun', () => {
    const directory = mkdtempSync(join(tmpdir(), 'guide-private-deploy-'))
    directories.push(directory)
    const bin = join(directory, 'bin')
    const deployment = join(directory, 'deployment')
    mkdirSync(bin)
    mkdirSync(deployment)
    const gh = join(bin, 'gh')
    writeFileSync(gh, [
      '#!/usr/bin/env bash',
      'set -euo pipefail',
      '[[ "$1" == api ]]',
      '[[ "$2" == repos/liu850002292/token_guide_ll/contents/deploy/* ]]',
      '[[ "$3" == -H && "$4" == "Accept: application/vnd.github.raw+json" ]]',
      'path="${2%%\\?*}"',
      'cat "${TEST_TEMPLATE_DIR}/${path##*/}"',
      '',
    ].join('\n'))
    chmodSync(gh, 0o755)
    const curl = join(bin, 'curl')
    writeFileSync(curl, '#!/usr/bin/env bash\nexit 22\n')
    chmodSync(curl, 0o755)
    const options = {
      cwd: deployment,
      encoding: 'utf8' as const,
      env: {
        ...process.env,
        PATH: `${shellPath(bin)}${process.platform === 'win32' ? ';' : ':'}${process.env.PATH}`,
        TEST_TEMPLATE_DIR: shellPath(resolve('deploy')),
        IMAGE_REPOSITORY: '850002292/sub2api-guide',
        HOST_PORT: '38123',
      },
    }
    const script = shellPath(resolve('deploy/docker-deploy.sh'))
    execFileSync(bash, [script], options)
    const initial = readFileSync(join(deployment, '.env'), 'utf8')
    expect(initial).toContain('IMAGE_REPOSITORY=850002292/sub2api-guide')
    expect(initial).toContain('NUXT_UPDATE_GITHUB_REPO=liu850002292/token_guide_ll')
    expect(initial).toContain('HOST_PORT=38123')
    expect(initial).not.toContain('replace-with-')
    expect(initial).not.toMatch(/^IMAGE_TAG=/m)
    expect(readFileSync(join(deployment, 'docker-compose.yml'), 'utf8'))
      .toContain('${IMAGE_REPOSITORY:-850002292/sub2api-guide}')

    execFileSync(bash, [script], options)
    expect(readFileSync(join(deployment, '.env'), 'utf8')).toBe(initial)
  }, 30_000)

  it('installs from public downloads without GitHub authentication', () => {
    const directory = mkdtempSync(join(tmpdir(), 'guide-public-deploy-'))
    directories.push(directory)
    const bin = join(directory, 'bin')
    const deployment = join(directory, 'deployment')
    mkdirSync(bin)
    const commands = join(directory, 'commands.log')
    const stubs = {
      curl: [
        '#!/usr/bin/env bash',
        'set -euo pipefail',
        '[[ "$1" == -fsSL || "$1" == -fsS ]]',
        'case "$2" in',
        '  https://raw.githubusercontent.com/liu850002292/token_guide_ll/main/deploy/*)',
        '    [[ "$3" == -o ]]',
        '    cp "${TEST_TEMPLATE_DIR}/${2##*/}" "$4" ;;',
        '  http://127.0.0.1:38124/api/health) exit 0 ;;',
        '  *) exit 22 ;;',
        'esac',
      ],
      gh: [
        '#!/usr/bin/env bash',
        'echo "unexpected gh call" >> "$TEST_COMMANDS"',
        'exit 1',
      ],
      docker: [
        '#!/usr/bin/env bash',
        'echo "$*" >> "$TEST_COMMANDS"',
      ],
    }
    for (const [name, lines] of Object.entries(stubs)) {
      const path = join(bin, name)
      writeFileSync(path, [...lines, ''].join('\n'))
      chmodSync(path, 0o755)
    }
    // Git Bash resets PATH in child shells; keep command stubs first in each shell.
    const bashEnv = join(directory, 'bash-env')
    writeFileSync(bashEnv, 'export PATH="$(cd "$TEST_BIN" && pwd):$PATH"\n')
    // Piping the installer reproduces remote installation without a local checkout.
    execFileSync(bash, ['-s', '--', '--install-dir', shellPath(deployment), '--port', '38124'], {
      cwd: directory,
      input: readFileSync(resolve('scripts/install-guide.sh'), 'utf8'),
      encoding: 'utf8',
      env: {
        ...process.env,
        PATH: `${shellPath(bin)}${process.platform === 'win32' ? ';' : ':'}${process.env.PATH}`,
        BASH_ENV: shellPath(bashEnv),
        TEST_BIN: shellPath(bin),
        TEST_TEMPLATE_DIR: shellPath(resolve('deploy')),
        TEST_COMMANDS: shellPath(commands),
      },
    })
    expect(readFileSync(join(deployment, '.env'), 'utf8')).toContain('HOST_PORT=38124')
    expect(existsSync(join(deployment, 'docker-compose.yml'))).toBe(true)
    const calls = readFileSync(commands, 'utf8')
    expect(calls).toContain('pull 850002292/sub2api-guide:latest')
    expect(calls).toContain('compose up -d --remove-orphans')
    expect(calls).not.toContain('unexpected gh call')
  }, 30_000)
})
