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

describe('private repository deployment', () => {
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
})
