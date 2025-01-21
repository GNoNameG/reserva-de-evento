import json
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt
from datetime import datetime

from .models import Event, Reservation

@csrf_exempt
def register_user(request):
    if request.method == 'POST':
        body = json.loads(request.body)
        username = body.get('username')
        email = body.get('email')
        password = body.get('password')

        # Valida que el email no esté ya registrado
        if User.objects.filter(email=email).exists():
            return JsonResponse({'error': 'El correo electrónico ya está registrado.'}, status=400)

        # Crea el usuario
        user = User.objects.create_user(username=username, email=email, password=password)
        user.save()
        return JsonResponse({'message': 'Usuario registrado exitosamente.'}, status=201)

    return JsonResponse({'error': 'Método no permitido'}, status=405)

@csrf_exempt
def login_user(request):
    if request.method == 'POST':
        body = json.loads(request.body)
        email = body.get('email')
        password = body.get('password')

        # Busca usuario por email
        try:
            user = User.objects.get(email=email)
            username = user.username
        except User.DoesNotExist:
            return JsonResponse({'error': 'Credenciales inválidas.'}, status=400)

        # Autenticar
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return JsonResponse({'message': 'Login exitoso'}, status=200)
        else:
            return JsonResponse({'error': 'Credenciales inválidas.'}, status=400)

    return JsonResponse({'error': 'Método no permitido'}, status=405)

def logout_user(request):
    if request.method == 'POST':
        logout(request)
        return JsonResponse({'message': 'Logout exitoso'})
    return JsonResponse({'error': 'Método no permitido'}, status=405)

def list_events(request):
    if request.method == 'GET':
        events = Event.objects.all()
        data = []
        for evt in events:
            data.append({
                'id': evt.id,
                'nombre': evt.nombre,
                'fecha': evt.fecha.strftime('%Y-%m-%d'),
                'hora': evt.hora.strftime('%H:%M'),
                'lugar': evt.lugar,
                'categoria': evt.categoria or '',
                'image_url': evt.image_url 
            })
        return JsonResponse(data, safe=False)
    return JsonResponse({'error': 'Método no permitido'}, status=405)

def get_event_seats(request, event_id):
    if request.method == 'GET':
        # Supongamos que hay 50 asientos disponibles en total (A1, A2... etc.)
        # En un proyecto real, lo haríamos dinámico o con un modelo Asientos.
        asientos_total = [f"A{i}" for i in range(1, 51)]  # A1, A2, ... A50

        # Verificar asientos ya reservados para este evento
        reservas = Reservation.objects.filter(event_id=event_id)
        asientos_ocupados = []
        for r in reservas:
            asientos_ocupados.extend(r.seats.split(','))

        asientos_disponibles = [a for a in asientos_total if a not in asientos_ocupados]

        return JsonResponse({
            'asientosDisponibles': asientos_disponibles,
            'asientosOcupados': list(set(asientos_ocupados)) 
        })
    return JsonResponse({'error': 'Método no permitido'}, status=405)

@csrf_exempt
def reservar_asientos(request):
    if request.method == 'POST':
        body = json.loads(request.body)
        evento_id = body.get('eventoId')
        asientos = body.get('asientos', [])

        if not request.user.is_authenticated:
            return JsonResponse({'success': False, 'error': 'Usuario no autenticado.'}, status=401)

        event = Event.objects.get(id=evento_id)
        # Se convierte la lista de asientos en string
        asientos_str = ','.join(asientos)

        # Crear la reserva
        reservation = Reservation.objects.create(
            user=request.user,
            event=event,
            seats=asientos_str
        )

        # Enviar correo de confirmación:
        # from django.core.mail import send_mail
        # send_mail(
        #     'Confirmación de Reserva',
        #     f'Has reservado los asientos: {asientos_str} para el evento {event.nombre}.',
        #     'tu_correo@ejemplo.com',  # Remitente
        #     [request.user.email],      # Destinatario
        #     fail_silently=False,
        # )

        return JsonResponse({'success': True, 'reservation_id': reservation.id})

    return JsonResponse({'error': 'Método no permitido'}, status=405)
