
from urllib import request
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.models import User
from decimal import Decimal

from .models import Wallet, Expense, Budget
from .serializers import WalletSerializer, ExpenseSerializer, BudgetSerializer, RegisterSerializer
from .permissions import ReadOnlyOrIsAuthenticated
from django.utils.timezone import now
from django.db.models import Sum
# ----------------------------
# Wallet ViewSet
# ----------------------------
class WalletViewSet(viewsets.ModelViewSet):
    serializer_class = WalletSerializer
    permission_classes = [ReadOnlyOrIsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return Wallet.objects.filter(user=self.request.user)
        return Wallet.objects.none()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated], url_path='add-amount')
    def add_amount(self, request):
        amount = Decimal(str(request.data.get('amount')))
        wallet, _ = Wallet.objects.get_or_create(user=request.user)
        wallet.balance += amount
        wallet.save()
        return Response({'message': 'Amount added', 'new_balance': wallet.balance})


# ----------------------------
# Expense ViewSet
# ----------------------------
class ExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenseSerializer
    permission_classes = [ReadOnlyOrIsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return Expense.objects.filter(user=self.request.user).order_by('-date')
        return Expense.objects.none()

    def perform_create(self, serializer):
        wallet, _ = Wallet.objects.get_or_create(user=self.request.user)
        expense_amount = serializer.validated_data['amount']
        wallet.balance -= expense_amount
        wallet.save()
        serializer.save(user=self.request.user)

class BudgetViewSet(viewsets.ModelViewSet):
    serializer_class = BudgetSerializer
    permission_classes = [ReadOnlyOrIsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return Budget.objects.filter(user=self.request.user)
        return Budget.objects.none()

    def create(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return Response({"detail": "Authentication required."}, status=403)

        amount = request.data.get("amount")
        period = request.data.get("period")
        notify = request.data.get("notify_on_threshold", True)  # default True

        if not amount or not period:
            return Response({"detail": "Both amount and period are required."}, status=400)

        try:
            amount = float(amount)
        except ValueError:
            return Response({"detail": "Amount must be a number."}, status=400)

        budget, _ = Budget.objects.get_or_create(
            user=request.user,
            defaults={
                "daily_budget": 0,
                "monthly_budget": 0,
                "yearly_budget": 0,
            }
        )
        
        if period == "daily":
            budget.daily_budget = amount
        elif period == "monthly":
            budget.monthly_budget = amount
        elif period == "yearly":
            budget.yearly_budget = amount
        else:
            return Response({"detail": "Invalid period."}, status=400)

        budget.notify_on_threshold = notify
        budget.save()

        serializer = self.get_serializer(budget)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"])
    def check_usage(self, request):
        user = request.user
        if not user.is_authenticated:
            return Response({"detail": "Authentication required."}, status=403)

        try:
            budget = Budget.objects.get(user=user)
        except Budget.DoesNotExist:
            return Response({"detail": "No budget set."}, status=404)

        today = now().date()
        month_start = today.replace(day=1)
        year_start = today.replace(month=1, day=1)

        daily_spent = Expense.objects.filter(user=user, date=today).aggregate(Sum("amount"))["amount__sum"] or 0
        monthly_spent = Expense.objects.filter(user=user, date__gte=month_start).aggregate(Sum("amount"))["amount__sum"] or 0
        yearly_spent = Expense.objects.filter(user=user, date__gte=year_start).aggregate(Sum("amount"))["amount__sum"] or 0

        alerts = {}

        if budget.notify_on_threshold:
            if budget.daily_budget and daily_spent >= 0.5 * float(budget.daily_budget):
                alerts["daily"] = f"⚠️ You have used ₹{daily_spent}, which is over 50% of your daily budget ₹{budget.daily_budget}."
            if budget.monthly_budget and monthly_spent >= 0.5 * float(budget.monthly_budget):
                alerts["monthly"] = f"⚠️ You have used ₹{monthly_spent}, which is over 50% of your monthly budget ₹{budget.monthly_budget}."
            if budget.yearly_budget and yearly_spent >= 0.5 * float(budget.yearly_budget):
                alerts["yearly"] = f"⚠️ You have used ₹{yearly_spent}, which is over 50% of your yearly budget ₹{budget.yearly_budget}."

        return Response({"alerts": alerts}, status=200)

# ----------------------------
# Register View
# ----------------------------
from rest_framework import generics

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer
