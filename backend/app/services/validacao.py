import requests


base_url = "http://seu-servidor.com"  


login_data = {
    "email": "seu@exemplo.com",
    "senha": "sua_senha"
}

response = requests.post(f"{base_url}/auth/login", json=login_data)
if response.status_code == 200:
    token = response.json()["token"]
    print("Login bem-sucedido! Token:", token)
    
    colaborador_data = {
        "email": "colaborador@exemplo.com",
        "senha": "senha123",
        "cpf": "12345678900",
        "dataNascimento": "2000-01-01"
    }
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(
        f"{base_url}/usuarios/colaboradores",
        json=colaborador_data,
        headers=headers
    )
    if response.status_code == 201:
        print("Colaborador criado com sucesso!")
    else:
        print("Erro ao criar colaborador:", response.status_code, response.json())
else:
    print("Falha no login:", response.status_code, response.json())