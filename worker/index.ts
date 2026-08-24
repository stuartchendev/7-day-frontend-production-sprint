type Env = {
  ASSETS: {
    fetch(request: Request): Promise<Response>
  }
}

export default {
  async fetch(request: Request, env: Env) {
    const response = await env.ASSETS.fetch(request)

    if (response.status !== 404) {
      return response
    }

    return env.ASSETS.fetch(new Request(new URL('/', request.url), request))
  },
}
