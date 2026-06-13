import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:flutter/foundation.dart' show kIsWeb;
import 'login_screen.dart';
import 'payment_screen.dart';

class LandingScreen extends StatefulWidget {
  const LandingScreen({super.key});

  @override
  State<LandingScreen> createState() => _LandingScreenState();
}

class _LandingScreenState extends State<LandingScreen> {
  final _refController = TextEditingController();
  final _licenseController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  bool _isLoading = false;
  String _errorMessage = '';

  // API Gateway URL.
  static const String _host = kIsWeb ? 'localhost' : '10.0.2.2';
  final String _apiBase = 'http://$_host:8090/api/v1';

  Future<void> _handleFineSearch() async {
    if (!_formKey.currentState!.validate()) return;

    final ref = _refController.text.trim().toUpperCase();
    final license = _licenseController.text.trim().toUpperCase();

    setState(() {
      _isLoading = true;
      _errorMessage = '';
    });

    try {
      final response = await http.get(
        Uri.parse('$_apiBase/fines/$ref'),
      );

      if (response.statusCode == 200) {
        final fineDetails = jsonDecode(response.body);
        final serverLicense = (fineDetails['licenseNumber'] ?? '').toString().toUpperCase();

        if (serverLicense == license) {
          if (mounted) {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => PaymentScreen(
                  token: '',
                  isMock: false,
                  initialFineDetails: fineDetails,
                ),
              ),
            );
          }
        } else {
          setState(() {
            _errorMessage = 'License number does not match this fine reference.';
          });
        }
      } else {
        _tryOfflineBypass(ref, license);
      }
    } catch (e) {
      _tryOfflineBypass(ref, license);
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  void _tryOfflineBypass(String ref, String license) {
    // Standard mock data from payment_screen.dart
    if (ref.startsWith('F') && license.length >= 6) {
      final fineDetails = {
        'referenceNumber': ref,
        'category': {'name': 'Speeding Above Limit', 'fineAmount': 3000.0},
        'driverName': 'Kamal Silva',
        'driverPhone': '0711122334',
        'licenseNumber': license,
        'vehicleNumber': 'WP-CAB-1234',
        'amount': 3000.0,
        'status': 'UNPAID',
        'district': 'Colombo'
      };
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => PaymentScreen(
            token: '',
            isMock: true,
            initialFineDetails: fineDetails,
          ),
        ),
      );
    } else {
      setState(() {
        _errorMessage = 'No active fine found for reference $ref. Use Ref starting with F and valid license for offline demo.';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Branding Header
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Theme.of(context).primaryColor.withOpacity(0.1),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.local_police,
                    size: 80,
                    color: Color(0xFF5BC0BE),
                  ),
                ),
                const SizedBox(height: 24),
                const Text(
                  'SRI LANKA POLICE',
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.5,
                  ),
                ),
                const Text(
                  'Digital Traffic Fine Settlement Portal',
                  style: TextStyle(color: Colors.grey, fontSize: 14),
                ),
                const SizedBox(height: 32),

                // Motorist Payment Container Box
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F172A),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.white10),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Motorist Quick Pay',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFFFFD700),
                        ),
                      ),
                      const SizedBox(height: 6),
                      const Text(
                        'Enter your fine reference number and license number to pay immediately.',
                        style: TextStyle(color: Colors.grey, fontSize: 11),
                      ),
                      const Divider(color: Colors.white10, height: 24),
                      TextFormField(
                        controller: _refController,
                        textCapitalization: TextCapitalization.characters,
                        decoration: InputDecoration(
                          labelText: 'Fine Reference Number',
                          prefixIcon: const Icon(Icons.receipt),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                        validator: (val) => val == null || val.isEmpty ? 'Required field' : null,
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: _licenseController,
                        textCapitalization: TextCapitalization.characters,
                        decoration: InputDecoration(
                          labelText: 'Driver License Number',
                          prefixIcon: const Icon(Icons.badge),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                        validator: (val) => val == null || val.isEmpty ? 'Required field' : null,
                      ),
                      const SizedBox(height: 16),
                      if (_errorMessage.isNotEmpty)
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: Colors.red.withOpacity(0.1),
                            border: Border.all(color: Colors.red.withOpacity(0.3)),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.error_outline, color: Colors.red, size: 18),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  _errorMessage,
                                  style: const TextStyle(color: Colors.red, fontSize: 11),
                                ),
                              ),
                            ],
                          ),
                        ),
                      const SizedBox(height: 16),
                      SizedBox(
                        width: double.infinity,
                        height: 48,
                        child: ElevatedButton(
                          onPressed: _isLoading ? null : _handleFineSearch,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF5BC0BE),
                            foregroundColor: Colors.black,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10),
                            ),
                          ),
                          child: _isLoading
                              ? const SizedBox(
                                  height: 20,
                                  width: 20,
                                  child: CircularProgressIndicator(color: Colors.black, strokeWidth: 2),
                                )
                              : const Text(
                                  'Find & Pay Fine',
                                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                                ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 32),

                // Link to Officer Portal
                const Text(
                  'Are you a police officer?',
                  style: TextStyle(color: Colors.grey, fontSize: 12),
                ),
                TextButton(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const LoginScreen()),
                    );
                  },
                  child: const Text(
                    'Access Officer Portal',
                    style: TextStyle(
                      color: Color(0xFF5BC0BE),
                      fontWeight: FontWeight.bold,
                      decoration: TextDecoration.underline,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
